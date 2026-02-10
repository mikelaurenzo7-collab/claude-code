"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAppStore } from "@/lib/store";
import { brandApi, sampleApi, authApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  Sparkles,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Zap,
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, title: "Welcome", icon: Sparkles },
  { id: 2, title: "Create Brand", icon: Mic },
  { id: 3, title: "Add Sample", icon: FileText },
  { id: 4, title: "All Set", icon: Check },
];

const SAMPLE_CONTENT = `Here's an example of the kind of content I create. I like to speak directly to my audience
and share practical insights they can use right away. My style is conversational but
informative - I don't take myself too seriously, but I always aim to provide real value.

When I'm explaining complex topics, I break them down into simple steps. I use analogies
and real-world examples to make concepts click. And I always try to end with a clear
takeaway that people can implement immediately.`;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { setCurrentBrand } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [brandName, setBrandName] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [sampleContent, setSampleContent] = useState("");
  const [createdBrandId, setCreatedBrandId] = useState<string | null>(null);

  useEffect(() => {
    analytics.onboardingStarted();
  }, []);

  // Redirect if onboarding already completed
  useEffect(() => {
    if (user?.onboarding_completed) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const goNext = () => {
    analytics.onboardingStepCompleted(currentStep, STEPS[currentStep - 1].title);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateBrand = async () => {
    if (!brandName.trim()) {
      toast.error("Please enter a brand name");
      return;
    }

    setIsLoading(true);
    try {
      const brand = await brandApi.create({
        name: brandName,
        niche: niche || undefined,
        target_audience: targetAudience || undefined,
        primary_goal: "growth",
      });

      setCreatedBrandId(brand.id);
      setCurrentBrand(brand);
      analytics.brandCreated(brand.id);
      goNext();
    } catch (error) {
      toast.error("Failed to create brand");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSample = async () => {
    if (!createdBrandId) {
      toast.error("Please create a brand first");
      return;
    }

    if (!sampleContent.trim()) {
      toast.error("Please add some sample content");
      return;
    }

    setIsLoading(true);
    try {
      await sampleApi.create({
        brand: createdBrandId,
        source_type: "paste",
        title: "Onboarding Sample",
        raw_text: sampleContent,
      });
      goNext();
    } catch (error) {
      toast.error("Failed to add sample");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await authApi.updateMe({ onboarding_completed: true });
      setUser(updatedUser);
      analytics.onboardingCompleted();
      toast.success("Welcome to Creator Studio!");
      router.push("/dashboard");
    } catch (error) {
      // Still redirect even if update fails
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    analytics.onboardingSkipped(currentStep);
    setIsLoading(true);
    try {
      const updatedUser = await authApi.updateMe({ onboarding_completed: true });
      setUser(updatedUser);
      router.push("/dashboard");
    } catch (error) {
      router.push("/dashboard");
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <step.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to Creator Studio!</CardTitle>
              <CardDescription className="text-base">
                Let&apos;s get you set up in just 2 minutes. We&apos;ll help you create your
                first brand and teach the AI your unique voice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-1">1. Create your brand</h3>
                  <p className="text-sm text-muted-foreground">
                    Define your niche and target audience
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-1">2. Train your voice</h3>
                  <p className="text-sm text-muted-foreground">
                    Add a content sample so AI sounds like you
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-1">3. Start creating</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload content and generate posts
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={handleSkip}>
                  Skip for now
                </Button>
                <Button onClick={goNext}>
                  Let&apos;s Go
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Create Brand */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Brand</CardTitle>
              <CardDescription>
                This helps us understand your content and audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Brand Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., The Growth Show, Tech Insights"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Niche (optional)</label>
                <Input
                  placeholder="e.g., SaaS, Personal Development, Marketing"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience (optional)</label>
                <Textarea
                  placeholder="e.g., Startup founders, mid-career professionals, aspiring entrepreneurs"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleCreateBrand} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                  {isLoading ? "Creating..." : "Create Brand"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Add Sample */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Train Your Voice</CardTitle>
              <CardDescription>
                Paste a sample of your content so AI learns your style.
                This could be from a blog post, newsletter, or transcript.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Content Sample</label>
                <Textarea
                  placeholder="Paste some of your existing content here..."
                  value={sampleContent}
                  onChange={(e) => setSampleContent(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{sampleContent.split(/\s+/).filter(Boolean).length} words</span>
                  <button
                    type="button"
                    onClick={() => setSampleContent(SAMPLE_CONTENT)}
                    className="text-primary hover:underline"
                  >
                    Use example content
                  </button>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={goNext}>
                    Skip
                  </Button>
                  <Button onClick={handleAddSample} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                    {isLoading ? "Saving..." : "Add Sample"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">You&apos;re All Set!</CardTitle>
              <CardDescription className="text-base">
                Your brand is created and ready to go. Now let&apos;s create some content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Next steps:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    Upload a podcast episode or paste a transcript
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    Review AI-detected clips
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    Generate content for Twitter, LinkedIn, and more
                  </li>
                </ul>
              </div>
              <Button onClick={handleComplete} className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
