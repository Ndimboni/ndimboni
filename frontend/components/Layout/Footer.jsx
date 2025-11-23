import { Layout, Row, Col, Typography, Divider } from 'antd'
import { 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined
} from '@ant-design/icons'

const { Footer: AntFooter } = Layout
const { Title, Text, Paragraph } = Typography

import { siteConfig } from '../../config/site'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = siteConfig.navItems.map(item => ({
    title: item.label,
    href: item.href
  }))

  const socialLinks = [
    { icon: <TwitterOutlined />, href: siteConfig.socials.twitter, label: 'Twitter' },
    { icon: <LinkedinOutlined />, href: siteConfig.socials.linkedin, label: 'LinkedIn' },
  ]

  const contactInfo = [
    { icon: <MailOutlined />, text: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
    { icon: <PhoneOutlined />, text: siteConfig.contact.phone, href: `tel:${siteConfig.contact.phone}` },
    { icon: <EnvironmentOutlined />, text: siteConfig.contact.address, href: '#' },
  ]

  const techStack = [
    { name: 'Next Js', description: 'Cross-platform Web development', color: 'blue' },
    { name: 'FastAPI', description: 'High-performance Python backend', color: 'green' },
    { name: 'Machine Learning', description: 'NLP & anomaly detection', color: 'purple' },
    { name: 'Whatsap & Telegram API', description: 'Seamless reporting integration', color: 'yellow' },
  ]

  return (
    <AntFooter className="footer" style={{ padding: 0,borderRadius:'15px 15px 0 0' }}>
      <div style={{ padding: '40px 24px 24px' }}>
        <Row gutter={[32, 32]}>
          {/* Company Info */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={4} className="text-white mb-4">
              {siteConfig.name}
            </Title>
            <Paragraph className="text-white text-opacity-90 mb-4">
              {siteConfig.description}
            </Paragraph>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="headerIcon text-xl hover:text-blue-300 transition-colors duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={4} className="text-white mb-4">
              Quick Links
            </Title>
            <ul className="footerList">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-white text-opacity-90 hover:text-blue-300 transition-colors duration-300"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={4} className="text-white mb-4">
              Contact Info
            </Title>
            <ul className="footerList">
              {contactInfo.map((contact, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2 text-blue-300">{contact.icon}</span>
                  <a 
                    href={contact.href}
                    className="text-white text-opacity-90 hover:text-blue-300 transition-colors duration-300"
                  >
                    {contact.text}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          {/* Technology Stack */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={4} className="text-white mb-4">
              Technology Stack
            </Title>
            <ul className="footerList">
              {techStack.map((tech, index) => (
                <li key={index} className="mb-2">
                  <Text className="text-white font-medium block">{tech.name}</Text>
                  <Text className="text-white text-opacity-70 text-sm">{tech.description}</Text>
                </li>
              ))}
            </ul>
          </Col>
        </Row>

        {/* Divider */}
        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '32px 0 16px 0' }} />
        
        {/* Copyright Section */}
        <div className="copyright">
          <span>
            © {currentYear} {siteConfig.name}. All rights reserved. | 
           
            University Of Rwanda
          </span>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer