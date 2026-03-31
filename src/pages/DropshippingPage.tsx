import React, { useState } from 'react';
import { ShoppingBag, Package, Truck, TrendingUp, Search, Star, Plus, ExternalLink, DollarSign, RefreshCw, MessageSquare } from 'lucide-react';
import StatCard from '@/components/features/StatCard';
import StatusBadge from '@/components/features/StatusBadge';
import {
  getDropshipProducts, saveDropshipProducts,
  getDropshipOrders, saveDropshipOrders,
  getSuppliers, formatCurrency, timeAgo, randomId
} from '@/lib/mockData';
import type { DropshipProduct, DropshipOrder } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TABS = ['Products', 'Orders', 'Suppliers', 'Research'] as const;
type Tab = typeof TABS[number];

export default function DropshippingPage() {
  const [tab, setTab] = useState<Tab>('Products');
  const [products, setProducts] = useState(getDropshipProducts);
  const [orders, setOrders] = useState(getDropshipOrders);
  const suppliers = getSuppliers();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', category: '', costPrice: '', sellingPrice: '', supplier: '', platform: 'Shopify', description: '' });
  const [generating, setGenerating] = useState<string | null>(null);
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResults, setResearchResults] = useState<null | typeof products>(null);
  const [researchRunning, setResearchRunning] = useState(false);

  const totalRevenue = products.reduce((a, p) => a + p.revenue, 0);
  const totalOrders = orders.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const avgMargin = products.length ? Math.round(products.reduce((a, p) => a + p.margin, 0) / products.length) : 0;

  const addProduct = () => {
    if (!productForm.name || !productForm.costPrice || !productForm.sellingPrice) {
      toast.error('Name and prices required'); return;
    }
    const cost = parseFloat(productForm.costPrice);
    const sell = parseFloat(productForm.sellingPrice);
    const margin = Math.round(((sell - cost) / sell) * 100);
    const p: DropshipProduct = {
      id: `dp_${randomId()}`,
      name: productForm.name,
      category: productForm.category || 'General',
      supplier: productForm.supplier || 'Unknown',
      supplierUrl: 'https://aliexpress.com',
      costPrice: cost,
      sellingPrice: sell,
      margin,
      platform: productForm.platform,
      status: 'researching',
      imageUrl: `https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&h=200&fit=crop&random=${Date.now()}`,
      salesCount: 0,
      revenue: 0,
      description: productForm.description || `High-quality ${productForm.name} for online sale.`,
      tags: [productForm.category.toLowerCase()],
      createdAt: new Date().toISOString(),
    };
    const updated = [...products, p];
    setProducts(updated);
    saveDropshipProducts(updated);
    setShowAddProduct(false);
    setProductForm({ name: '', category: '', costPrice: '', sellingPrice: '', supplier: '', platform: 'Shopify', description: '' });
    toast.success(`Product "${p.name}" added to inventory`);
  };

  const generateListing = (id: string) => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
      toast.success('AI-generated listing created and published!');
    }, 2200);
  };

  const fulfillOrder = (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'processing' as DropshipOrder['status'] } : o);
    setOrders(updated);
    saveDropshipOrders(updated);
    toast.success('Order forwarded to supplier via automation');
    setTimeout(() => {
      const shipped = updated.map(o => o.id === id ? { ...o, status: 'shipped' as DropshipOrder['status'], shippedAt: new Date().toISOString() } : o);
      setOrders(shipped);
      saveDropshipOrders(shipped);
    }, 3000);
  };

  const runResearch = () => {
    if (!researchQuery.trim()) { toast.error('Enter a niche or keyword'); return; }
    setResearchRunning(true);
    setResearchResults(null);
    setTimeout(() => {
      setResearchResults(products.slice(0, 3));
      setResearchRunning(false);
      toast.success(`Found 3 winning products for "${researchQuery}"`);
    }, 3000);
  };

  const scanSuppliers = () => {
    setScanning(true);
    toast.info('MERCH-BOT scanning AliExpress, CJ Dropshipping, Spocket...');
    setTimeout(() => {
      setScanning(false);
      toast.success('Scan complete — 47 new products discovered across 4 suppliers');
    }, 3000);
  };

  return (
    <div className="space-y-6 slide-in-up">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} sub="across all products" icon={<DollarSign size={16} />} accent="cyan" />
        <StatCard label="Active Products" value={`${activeProducts}`} sub="listed and selling" accent="green" />
        <StatCard label="Total Orders" value={`${totalOrders}`} sub="fulfilled by autopilot" accent="violet" />
        <StatCard label="Avg Margin" value={`${avgMargin}%`} sub="profit margin" accent="orange" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(228_25%_8%)] w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            'px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors',
            tab === t ? 'bg-[hsl(185_100%_50%/0.15)] text-[hsl(185,100%,55%)]' : 'text-muted-foreground hover:text-foreground'
          )} style={{ fontFamily: 'Orbitron' }}>{t}</button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === 'Products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>Product Inventory</h2>
            <div className="flex gap-2">
              <button onClick={scanSuppliers} disabled={scanning} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-[hsl(185_100%_50%/0.3)] bg-[hsl(185_100%_50%/0.08)] text-[hsl(185,100%,55%)] hover:bg-[hsl(185_100%_50%/0.15)] disabled:opacity-50 transition-colors">
                <Search size={13} className={scanning ? 'animate-spin' : ''} /> {scanning ? 'Scanning...' : 'Find Products'}
              </button>
              <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 transition-opacity">
                <Plus size={13} /> Add Product
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {products.map(product => (
              <div key={product.id} className="glass-panel rounded-xl border border-[hsl(var(--border))] p-4 hover:border-[hsl(185_100%_50%/0.2)] transition-all">
                <div className="flex items-start gap-4">
                  <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-[hsl(var(--border))]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-sm">{product.name}</h3>
                      <StatusBadge status={product.status} />
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                      <span>Cost: <span className="text-foreground">{formatCurrency(product.costPrice)}</span></span>
                      <span>Sell: <span className="text-[hsl(145,100%,55%)] font-semibold">{formatCurrency(product.sellingPrice)}</span></span>
                      <span>Margin: <span className="text-[hsl(185,100%,55%)] font-semibold">{product.margin}%</span></span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                      <span>{product.platform}</span>
                      <span>·</span>
                      <span>{product.supplier}</span>
                      <span>·</span>
                      <span>{product.salesCount} sales</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateListing(product.id)}
                        disabled={!!generating}
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded border border-[hsl(265_80%_55%/0.3)] bg-[hsl(265_80%_55%/0.08)] text-[hsl(265,80%,70%)] hover:bg-[hsl(265_80%_55%/0.15)] disabled:opacity-50 transition-colors"
                      >
                        {generating === product.id ? <><RefreshCw size={10} className="animate-spin" /> Generating...</> : <><Package size={10} /> AI Listing</>}
                      </button>
                      <button className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(228_25%_10%)] text-muted-foreground hover:text-foreground transition-colors">
                        <MessageSquare size={10} /> Message Template
                      </button>
                      <a href={product.supplierUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                  {product.revenue > 0 && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-bold text-[hsl(145,100%,55%)]" style={{ fontFamily: 'Orbitron' }}>{formatCurrency(product.revenue)}</div>
                      <div className="text-[10px] text-muted-foreground">revenue</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'Orders' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>Order Management</h2>
          {orders.map(order => (
            <div key={order.id} className="glass-panel rounded-xl border border-[hsl(var(--border))] p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{order.productName}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Customer: {order.customer}</span>
                  <span>Qty: {order.quantity}</span>
                  <span>{order.platform}</span>
                  <span>{timeAgo(order.createdAt)}</span>
                  {order.shippedAt && <span>Shipped: {timeAgo(order.shippedAt)}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-[hsl(145,100%,55%)]">+{formatCurrency(order.profit)}</div>
                <div className="text-[10px] text-muted-foreground">profit</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(order.revenue)} rev</div>
              </div>
              {order.status === 'pending' && (
                <button onClick={() => fulfillOrder(order.id)} className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 transition-opacity">
                  Fulfill
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Suppliers Tab */}
      {tab === 'Suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>Supplier Directory</h2>
            <button onClick={scanSuppliers} disabled={scanning} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 disabled:opacity-50 transition-all">
              <Search size={14} className={scanning ? 'animate-spin' : ''} />
              {scanning ? 'Scanning...' : 'Discover Suppliers'}
            </button>
          </div>
          <div className="grid gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5 hover:border-[hsl(185_100%_50%/0.2)] transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold">{sup.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[hsl(228_25%_12%)] text-muted-foreground border border-[hsl(var(--border))]">{sup.country}</span>
                      <div className="flex items-center gap-1 text-[hsl(50,100%,55%)] text-xs">
                        <Star size={11} fill="currentColor" /> {sup.rating}
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                      <span>Min Order: {sup.minOrder}</span>
                      <span>Shipping: {sup.shippingTime}</span>
                      <span>{sup.productsFound.toLocaleString()} products</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sup.categories.map(c => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-[hsl(185_100%_50%/0.08)] border border-[hsl(185_100%_50%/0.15)] text-[hsl(185,100%,65%)]">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={sup.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-[hsl(var(--border))] bg-[hsl(228_25%_10%)] text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLink size={12} /> Visit
                    </a>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[hsl(185_100%_50%/0.1)] border border-[hsl(185_100%_50%/0.25)] text-[hsl(185,100%,55%)] hover:bg-[hsl(185_100%_50%/0.2)] transition-colors">
                      <Search size={12} /> Scrape Products
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Tab */}
      {tab === 'Research' && (
        <div className="space-y-5">
          <div className="glass-panel rounded-xl border border-[hsl(185_100%_50%/0.2)] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ fontFamily: 'Orbitron' }}>AI Product Research Engine</h3>
            <p className="text-xs text-muted-foreground mb-4">MERCH-BOT uses Playwright to scrape AliExpress, Google Trends, and social media to find winning products in any niche.</p>
            <div className="flex gap-3">
              <input
                className="flex-1 px-4 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors"
                placeholder="Enter niche or keyword (e.g. 'fitness gadgets', 'kitchen tools')"
                value={researchQuery}
                onChange={e => setResearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runResearch()}
              />
              <button onClick={runResearch} disabled={researchRunning} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 disabled:opacity-50 transition-all">
                {researchRunning ? <><RefreshCw size={14} className="animate-spin" /> Researching...</> : <><Search size={14} /> Research</>}
              </button>
            </div>
            {researchRunning && (
              <div className="mt-4 space-y-2 font-mono text-xs text-muted-foreground">
                <div className="slide-in-up">› Navigating AliExpress <span className="text-[hsl(185,100%,55%)]">fitness</span> category...</div>
                <div className="slide-in-up" style={{ animationDelay: '0.5s' }}>› Extracting top 100 products by order volume...</div>
                <div className="slide-in-up" style={{ animationDelay: '1s' }}>› Checking Google Trends for demand validation...</div>
                <div className="slide-in-up" style={{ animationDelay: '1.5s' }}>› Calculating margins and competition scores...</div>
              </div>
            )}
          </div>

          {/* Research workflow steps */}
          <div className="glass-panel rounded-xl border border-[hsl(var(--border))] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4" style={{ fontFamily: 'Orbitron' }}>Automation Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: 1, icon: Search, label: 'Discover', desc: 'Browser scrapes AliExpress, Spocket, CJ Dropshipping for trending products', color: 'cyan' },
                { step: 2, icon: TrendingUp, label: 'Validate', desc: 'AI cross-references Google Trends, social media, and competitor listings', color: 'violet' },
                { step: 3, icon: Package, label: 'List', desc: 'Content Creator AI generates optimized title, description, and images', color: 'green' },
                { step: 4, icon: Truck, label: 'Fulfill', desc: 'Autopilot places supplier orders and sends tracking to customers', color: 'orange' },
              ].map(step => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className={`p-4 rounded-xl border ${
                    step.color === 'cyan' ? 'border-[hsl(185_100%_50%/0.2)] bg-[hsl(185_100%_50%/0.04)]' :
                    step.color === 'violet' ? 'border-[hsl(265_80%_55%/0.2)] bg-[hsl(265_80%_55%/0.04)]' :
                    step.color === 'green' ? 'border-[hsl(145_100%_50%/0.2)] bg-[hsl(145_100%_50%/0.04)]' :
                    'border-[hsl(30_100%_55%/0.2)] bg-[hsl(30_100%_55%/0.04)]'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.color === 'cyan' ? 'bg-[hsl(185_100%_50%/0.2)] text-[hsl(185,100%,55%)]' :
                        step.color === 'violet' ? 'bg-[hsl(265_80%_55%/0.2)] text-[hsl(265,80%,70%)]' :
                        step.color === 'green' ? 'bg-[hsl(145_100%_50%/0.2)] text-[hsl(145,100%,55%)]' :
                        'bg-[hsl(30_100%_55%/0.2)] text-[hsl(30,100%,60%)]'
                      }`}>{step.step}</div>
                      <Icon size={14} className="text-muted-foreground" />
                      <span className="text-xs font-bold">{step.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {researchResults && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>Research Results for "{researchQuery}"</h3>
              {researchResults.map(product => (
                <div key={product.id} className="glass-panel rounded-xl border border-[hsl(145_100%_50%/0.2)] p-4 flex items-center gap-4">
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{product.name}</h4>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>Cost: {formatCurrency(product.costPrice)}</span>
                      <span>Sell: {formatCurrency(product.sellingPrice)}</span>
                      <span className="text-[hsl(145,100%,55%)] font-semibold">Margin: {product.margin}%</span>
                    </div>
                  </div>
                  <button onClick={() => { const updated = [...products, { ...product, id: `dp_${randomId()}`, salesCount: 0, revenue: 0, status: 'researching' as const }]; setProducts(updated); saveDropshipProducts(updated); toast.success('Added to inventory'); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 transition-opacity">
                    Add Product
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddProduct(false)}>
          <div className="glass-panel-bright rounded-2xl border border-[hsl(185_100%_50%/0.2)] p-6 w-full max-w-lg mx-4 slide-in-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-4 text-neon-cyan" style={{ fontFamily: 'Orbitron' }}>ADD PRODUCT</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" placeholder="Product Name" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" placeholder="Category" value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} />
                <select className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" value={productForm.platform} onChange={e => setProductForm(f => ({ ...f, platform: e.target.value }))}>
                  <option>Shopify</option><option>eBay</option><option>Amazon</option><option>Etsy</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" placeholder="Cost Price ($)" value={productForm.costPrice} onChange={e => setProductForm(f => ({ ...f, costPrice: e.target.value }))} />
                <input type="number" className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" placeholder="Selling Price ($)" value={productForm.sellingPrice} onChange={e => setProductForm(f => ({ ...f, sellingPrice: e.target.value }))} />
              </div>
              <input className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors" placeholder="Supplier Name" value={productForm.supplier} onChange={e => setProductForm(f => ({ ...f, supplier: e.target.value }))} />
              <textarea className="w-full px-3 py-2.5 rounded-lg bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-sm focus:outline-none focus:border-[hsl(185_100%_50%/0.5)] transition-colors resize-none h-16" placeholder="Product description (optional)" value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddProduct(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[hsl(228_25%_10%)] border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={addProduct} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-black hover:opacity-90 transition-opacity">Add to Inventory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
