"""
Core Views - User, Workspace, Jobs
"""
import secrets
from datetime import timedelta

from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.conf import settings

from .models import Workspace, WorkspaceMember, GenerationJob
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    WorkspaceSerializer,
    WorkspaceMemberSerializer,
    GenerationJobSerializer,
)
from .permissions import IsWorkspaceOwnerOrAdmin, IsWorkspaceMember
from .email import send_password_reset_email, send_welcome_email

User = get_user_model()


# =============================================================================
# Authentication Views
# =============================================================================

class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    """Get/update current user."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordChangeView(generics.GenericAPIView):
    """Change password endpoint."""
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"message": "Password changed successfully"})


class PasswordResetRequestView(generics.GenericAPIView):
    """Request password reset email."""
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email, is_active=True)

            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Build reset URL (frontend URL)
            frontend_url = settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else "http://localhost:3000"
            reset_url = f"{frontend_url}/auth/reset-password?uid={uid}&token={token}"

            # Send email
            send_password_reset_email(user, reset_url)

        except User.DoesNotExist:
            # Don't reveal whether email exists
            pass

        # Always return success to prevent email enumeration
        return Response({
            "message": "If an account exists with this email, you will receive a password reset link."
        })


class PasswordResetConfirmView(generics.GenericAPIView):
    """Confirm password reset with token."""
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            if not default_token_generator.check_token(user, token):
                return Response(
                    {"error": "Invalid or expired reset link"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)
            user.save()

            return Response({"message": "Password reset successful"})

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Invalid reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )


# =============================================================================
# Workspace Views
# =============================================================================

class WorkspaceViewSet(viewsets.ModelViewSet):
    """Workspace CRUD."""
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        """Return workspaces the user has access to."""
        return Workspace.objects.filter(
            memberships__user=self.request.user
        ).distinct()

    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
            role="owner",
        )


class WorkspaceMemberViewSet(viewsets.ModelViewSet):
    """Workspace member management."""
    serializer_class = WorkspaceMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwnerOrAdmin]

    def get_queryset(self):
        """Return members of workspaces the user has access to."""
        user_workspaces = Workspace.objects.filter(
            memberships__user=self.request.user
        )
        return WorkspaceMember.objects.filter(workspace__in=user_workspaces)


# =============================================================================
# Generation Job Views
# =============================================================================

class GenerationJobViewSet(viewsets.ReadOnlyModelViewSet):
    """View generation job status."""
    serializer_class = GenerationJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return jobs for user's workspaces."""
        user_workspaces = Workspace.objects.filter(
            memberships__user=self.request.user
        )
        return GenerationJob.objects.filter(workspace__in=user_workspaces)

    @action(detail=True, methods=["get"])
    def poll(self, request, pk=None):
        """
        Poll job status - lightweight endpoint for frontend polling.
        """
        job = self.get_object()
        return Response({
            "id": str(job.id),
            "status": job.status,
            "progress": job.progress,
            "completed": job.status in ["completed", "failed"],
        })


class JobStatusView(APIView):
    """
    Quick job status check by ID.
    GET /api/v1/jobs/{job_id}/status/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id):
        try:
            # Verify user has access
            user_workspaces = Workspace.objects.filter(
                memberships__user=request.user
            )
            job = GenerationJob.objects.get(
                id=job_id,
                workspace__in=user_workspaces
            )

            return Response({
                "id": str(job.id),
                "job_type": job.job_type,
                "status": job.status,
                "progress": job.progress,
                "result": job.result if job.status == "completed" else None,
                "error": job.error_message if job.status == "failed" else None,
            })

        except GenerationJob.DoesNotExist:
            return Response(
                {"error": "Job not found"},
                status=status.HTTP_404_NOT_FOUND
            )
