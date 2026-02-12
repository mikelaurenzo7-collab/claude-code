import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Companies from '@/pages/Companies'
import CompanyDetail from '@/pages/CompanyDetail'
import Valuations from '@/pages/Valuations'
import DealPipeline from '@/pages/DealPipeline'
import DistressedAssets from '@/pages/DistressedAssets'
import RealEstate from '@/pages/RealEstate'
import FundIntelligence from '@/pages/FundIntelligence'
import Research from '@/pages/Research'
import Intelligence from '@/pages/Intelligence'
import Watchlists from '@/pages/Watchlists'
import Alerts from '@/pages/Alerts'
import SecSearch from '@/pages/SecSearch'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/valuations" element={<Valuations />} />
        <Route path="/deals" element={<DealPipeline />} />
        <Route path="/distressed" element={<DistressedAssets />} />
        <Route path="/real-estate" element={<RealEstate />} />
        <Route path="/fund-intelligence" element={<FundIntelligence />} />
        <Route path="/research" element={<Research />} />
        <Route path="/intelligence" element={<Intelligence />} />
        <Route path="/watchlists" element={<Watchlists />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/sec-search" element={<SecSearch />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
