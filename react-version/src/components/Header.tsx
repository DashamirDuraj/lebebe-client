import { ShoppingCart, Menu, Heart, Search, User, Phone, Package, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  activeFilter: 'all' | 'girl' | 'boy' | 'newborn';
  onFilterChange: (filter: 'all' | 'girl' | 'boy' | 'newborn') => void;
}

export function Header({ cartItemCount, onCartClick, activeFilter, onFilterChange }: HeaderProps) {
  const { t } = useLanguage();
  
  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-subtle relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7CC4E8] to-[#F7B6C7] rounded-2xl flex items-center justify-center shadow-elevated">
                  <span className="text-2xl">🍼</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#B8E9D2] rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl text-[#7CC4E8]" style={{fontFamily: 'Poppins, sans-serif', fontWeight: 700}}>
                  LeBebe
                </h1>
                <p className="text-xs text-neutral-500 -mt-0.5 font-medium">Albania</p>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder={t('header.search')}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#7CC4E8] focus:outline-none transition-colors"
                  style={{fontFamily: 'Inter, sans-serif'}}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <button 
                onClick={() => onFilterChange('all')}
                className={`text-sm font-semibold ${activeFilter === 'all' ? 'text-[#7CC4E8]' : 'hover:text-[#7CC4E8]'} transition-colors relative group`}
              >
                {t('header.shop')}
                <span className={`absolute -bottom-1 left-0 ${activeFilter === 'all' ? 'w-full' : 'w-0'} h-0.5 bg-[#7CC4E8] rounded-full group-hover:w-full transition-all`} />
              </button>
              <button 
                onClick={() => onFilterChange('girl')}
                className={`text-sm font-semibold ${activeFilter === 'girl' ? 'text-[#F7B6C7]' : 'hover:text-[#F7B6C7]'} transition-colors relative group`}
              >
                {t('header.babyGirl')}
                <span className={`absolute -bottom-1 left-0 ${activeFilter === 'girl' ? 'w-full' : 'w-0'} h-0.5 bg-[#F7B6C7] rounded-full group-hover:w-full transition-all`} />
              </button>
              <button 
                onClick={() => onFilterChange('boy')}
                className={`text-sm font-semibold ${activeFilter === 'boy' ? 'text-[#7CC4E8]' : 'hover:text-[#7CC4E8]'} transition-colors relative group`}
              >
                {t('header.babyBoy')}
                <span className={`absolute -bottom-1 left-0 ${activeFilter === 'boy' ? 'w-full' : 'w-0'} h-0.5 bg-[#7CC4E8] rounded-full group-hover:w-full transition-all`} />
              </button>
              <button 
                onClick={() => onFilterChange('newborn')}
                className={`text-sm font-semibold ${activeFilter === 'newborn' ? 'text-[#B8E9D2]' : 'hover:text-[#B8E9D2]'} transition-colors relative group`}
              >
                {t('header.newborn')}
                <span className={`absolute -bottom-1 left-0 ${activeFilter === 'newborn' ? 'w-full' : 'w-0'} h-0.5 bg-[#B8E9D2] rounded-full group-hover:w-full transition-all`} />
              </button>
              <a href="#" className="text-sm font-semibold text-[#DF6B87] relative group">
                {t('header.sale')}
                <Badge className="absolute -top-2 -right-10 bg-[#DC2626] text-white text-xs px-2 py-0 rounded-lg">-30%</Badge>
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#DF6B87] rounded-full" />
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" className="hidden lg:flex rounded-xl hover:bg-[#E6F4FB]">
                <Search className="w-5 h-5 text-neutral-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onCartClick} 
                className="relative rounded-xl hover:bg-[#B8E9D2]"
              >
                <ShoppingCart className="w-5 h-5 text-neutral-600" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#7CC4E8] text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-primary">
                    {cartItemCount}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}