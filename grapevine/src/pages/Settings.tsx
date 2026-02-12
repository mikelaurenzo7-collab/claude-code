import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/appStore'
import { Key, User, Shield, Database, Check } from 'lucide-react'

export default function Settings() {
  const { apiKeys, setApiKey, user } = useAppStore()
  const [openaiKey, setOpenaiKey] = useState(apiKeys.openai || '')
  const [fredKey, setFredKey] = useState(apiKeys.fred || '')
  const [avKey, setAvKey] = useState(apiKeys.alphavantage || '')
  const [saved, setSaved] = useState<string | null>(null)

  const saveKey = (provider: string, key: string) => {
    setApiKey(provider, key)
    setSaved(provider)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your API keys and preferences</p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user?.name || 'Demo User'}</p>
              <p className="text-sm text-muted-foreground">{user?.email || 'demo@grapevine.fund'}</p>
            </div>
            <Badge variant="default">Professional</Badge>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-4 w-4" /> API Keys</CardTitle>
          <CardDescription>Configure third-party API keys for live data and AI features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">OpenAI API Key</p>
                <p className="text-xs text-muted-foreground">Powers AI Research Chat and Memo Generation</p>
              </div>
              {apiKeys.openai && <Badge variant="success">Connected</Badge>}
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
              <Button onClick={() => saveKey('openai', openaiKey)} variant="outline">
                {saved === 'openai' ? <Check className="h-4 w-4 text-emerald-400" /> : 'Save'}
              </Button>
            </div>
          </div>

          {/* FRED */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">FRED API Key</p>
                <p className="text-xs text-muted-foreground">Federal Reserve Economic Data — free from fred.stlouisfed.org</p>
              </div>
              {apiKeys.fred && <Badge variant="success">Connected</Badge>}
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Your FRED API key..."
                value={fredKey}
                onChange={(e) => setFredKey(e.target.value)}
              />
              <Button onClick={() => saveKey('fred', fredKey)} variant="outline">
                {saved === 'fred' ? <Check className="h-4 w-4 text-emerald-400" /> : 'Save'}
              </Button>
            </div>
          </div>

          {/* Alpha Vantage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Alpha Vantage API Key</p>
                <p className="text-xs text-muted-foreground">Public market data for comparable company analysis</p>
              </div>
              {apiKeys.alphavantage && <Badge variant="success">Connected</Badge>}
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Your Alpha Vantage key..."
                value={avKey}
                onChange={(e) => setAvKey(e.target.value)}
              />
              <Button onClick={() => saveKey('alphavantage', avKey)} variant="outline">
                {saved === 'alphavantage' ? <Check className="h-4 w-4 text-emerald-400" /> : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="h-4 w-4" /> Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'SEC EDGAR', status: 'Live', description: 'Real SEC filings and XBRL financial data', live: true },
              { name: 'FRED Economic Data', status: apiKeys.fred ? 'Live' : 'Demo', description: 'Federal Reserve economic indicators', live: !!apiKeys.fred },
              { name: 'Company Profiles', status: 'Demo', description: '20 synthetic company profiles with modeled financials', live: false },
              { name: 'Distressed Assets', status: 'Demo', description: '8 synthetic distressed asset listings', live: false },
              { name: 'Real Estate Listings', status: 'Demo', description: '6 synthetic off-market RE listings', live: false },
              { name: 'AI Research', status: apiKeys.openai ? 'Live' : 'Demo', description: 'OpenAI-powered research and analysis', live: !!apiKeys.openai },
            ].map((source) => (
              <div key={source.name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{source.name}</p>
                  <p className="text-xs text-muted-foreground">{source.description}</p>
                </div>
                <Badge variant={source.live ? 'success' : 'secondary'}>{source.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Security</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-400" /> API keys stored locally in browser (never sent to our servers)</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-400" /> SEC EDGAR accessed directly — no proxy needed (public API)</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-400" /> All data persisted in localStorage with Zustand</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-400" /> OpenAI calls go directly to api.openai.com</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
