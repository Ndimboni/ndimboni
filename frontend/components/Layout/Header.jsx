import { useState, useEffect } from 'react'
import { Layout, Menu, Button, Drawer } from 'antd'
import { MenuOutlined, HomeOutlined, UserOutlined, MailOutlined, LogoutOutlined, AuditOutlined } from '@ant-design/icons'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

const { Header: AntHeader } = Layout

const Header = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link href="/">Home</Link>,
      href: '/'
    },
    {
      key: 'about',
      icon: <UserOutlined />,
      label: <Link href="/about">About</Link>,
      href: '/about'
    },
    {
      key: 'contact',
      icon: <MailOutlined />,
      label: <Link href="/contact">Contact</Link>,
      href: '/contact'
    },
    {
      key: 'report',
      icon: <AuditOutlined />,
      label: <Link href="/report">Report</Link>,
      href: '/report'
    },
    {
      key: 'auth',
      icon: <LogoutOutlined />,
      label: <Link href="/auth">Login</Link>,
      href: '/auth'
    },
  ]

  const showMobileMenu = () => {
    setMobileMenuVisible(true)
  }

  const closeMobileMenu = () => {
    setMobileMenuVisible(false)
  }

  const isActiveRoute = (href) => {
    return router.pathname === href
  }

  return (
    <AntHeader 
      className={`header ${scrolled ? 'shadow-lg' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        padding: '0 20px',
        height: 'auto',
        minHeight: '70px',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0">
          <div className="logo">
            <Image
              src="/images/ndimboni_logo.svg" 
              alt="Project Logo"
              width={60}
              height={60}
              className="ndimboni-logo"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
          
          {/* Moving Text Container */}
          <div className="movingTextContainer hidden md:block ml-4">
            <div className="movingText">
              <h1 className="animate-moving-text text-white text-lg font-bold">
                🛡️ Ndimboni - Digital Scam Protection Platform
              </h1>
            </div>
          </div>

          {/* Static Title for Mobile screens only */}
          <div className="block md:hidden ml-14">
            <h1 className="text-white text-lg font-bold">
              Ndimboni Platform
            </h1>
          </div>
        </div>

        {/* Desktop Navigation - Enhanced with active state and hover effects */}
        <div className="hidden lg:flex items-center">
          <div className="flex items-center space-x-6">
            {menuItems.map((item) => (
              <div 
                key={item.key} 
                className={`
                  flex items-center cursor-pointer transition-all duration-200 
                  text-white font-medium relative group
                  ${isActiveRoute(item.href) 
                    ? 'text-blue-300 border-b-2 border-blue-300 pb-1' 
                    : 'hover:text-blue-300'
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                <span className="relative">
                  {item.label}
                  {/* Underline effect on hover for non-active items */}
                  {!isActiveRoute(item.href) && (
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-300 transition-all duration-200 group-hover:w-full"></span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Header Actions */}
        <div className="headerActions flex-shrink-0">
          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={showMobileMenu}
            className="lg:hidden headerIcon text-white hover:text-blue-300"
            size="large"
            style={{marginRight:'25px'}}
          />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <Drawer
        title="Navigation"
        placement="right"
        closable={true}
        onClose={closeMobileMenu}
        open={mobileMenuVisible}
        styles={{
          body: {
            background: 'linear-gradient(135deg, #2980B9, #1A5276)',
            padding: 0,
            
          },
          header: {
            background: 'linear-gradient(135deg, #2980B9, #1A5276)',
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          onClick={closeMobileMenu}
          selectedKeys={[menuItems.find(item => item.href === router.pathname)?.key]}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
          }}
          className="mobile-menu"
        />
      </Drawer>

    </AntHeader>
  )
}

export default Header