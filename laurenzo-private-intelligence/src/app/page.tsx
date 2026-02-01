import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-4xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          Laurenzo Private Intelligence
        </h1>
        <p className="mb-2 text-xl text-muted-foreground">
          Private Markets Intelligence Platform
        </p>
        <p className="mb-8 text-lg text-muted-foreground">
          Accurate valuations for private companies and real estate assets
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
