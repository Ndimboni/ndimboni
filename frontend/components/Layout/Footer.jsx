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

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { title: 'Home', href: '/' },
    { title: 'About Us', href: '/about' },
    { title: 'Contact', href: '/contact' },
    { title: 'Documentation', href: '/' },
  ]

  const socialLinks = [
    { icon: <GithubOutlined />, href: 'https://github.com', label: 'GitHub' },
    { icon: <LinkedinOutlined />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <TwitterOutlined />, href: 'https://twitter.com', label: 'Twitter' },
  ]

  const contactInfo = [
    { icon: <MailOutlined />, text: 'project@university.edu', href: 'mailto:project@university.edu' },
    { icon: <PhoneOutlined />, text: '+250 783447260 / 784310609', href: 'tel:+250XXXXXXXXX' },
    { icon: <EnvironmentOutlined />, text: 'Kigali, Rwanda', href: '#' },
  ]

  const techStack = [
    { name: 'Next Js', description: 'Cross-platform Web development', color: 'blue' },
    { name: 'FastAPI', description: 'High-performance Python backend', color: 'green' },
    { name: 'Machine Learning', description: 'NLP & anomaly detection', color: 'purple' },
    { name: 'Telegram API', description: 'Seamless reporting integration', color: 'yellow' },
  ]

  return (
    <AntFooter className="footer" style={{ padding: 0,borderRadius:'15px 15px 0 0' }}>
      <div style={{ padding: '40px 24px 24px' }}>
        <Row gutter={[32, 32]}>
          {/* Company Info */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={4} className="text-white mb-4">
              Ndimboni
            </Title>
            <Paragraph className="text-white text-opacity-90 mb-4">
              An interactive web 
              platform powered by Artificial Intelligence to detect and combat digital scams. 
              Built with Next.js and modern development practices.
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
            © {currentYear} Ndimboni. All rights reserved. | 
           
            University Of Rwanda
          </span>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer