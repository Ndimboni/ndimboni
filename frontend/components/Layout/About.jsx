import { useState, useEffect } from 'react'
import { Typography, Button, Row, Col, Card, Space } from 'antd'
import { 
  AlertOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  FileTextOutlined,
  SafetyOutlined,
  WhatsAppOutlined,
  ExclamationCircleOutlined,
  BugOutlined,
  DollarOutlined,
  UserOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Paragraph, Text } = Typography

export default function ReportPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const reportCards = [
    {
      icon: <AlertOutlined className="text-4xl" style={{ color: '#e74c3c' }} />,
      title: 'Report Phishing Attempt',
      description: 'Have you received suspicious emails, messages, or links asking for personal information? Report phishing attempts to help protect yourself and others from identity theft and financial fraud.',
      details: 'Phishing scams often impersonate legitimate organizations like banks, government agencies, or popular services. They may ask for passwords, credit card numbers, or personal details through fake websites or messages.',
      buttonText: 'Report Phishing',
      buttonIcon: <ExclamationCircleOutlined />,
      gradient: 'from-red-500 to-red-600',
      bgColor: '#ffebee'
    },
    {
      icon: <DollarOutlined className="text-4xl" style={{ color: '#f39c12' }} />,
      title: 'Report Investment Scam',
      description: 'Encountered fake investment opportunities, cryptocurrency scams, or get-rich-quick schemes? Help us track and prevent fraudulent investment platforms that target unsuspecting victims.',
      details: 'Investment scams promise unrealistic returns with little to no risk. They often use fake testimonials, pressure tactics, and sophisticated websites to appear legitimate while stealing your money.',
      buttonText: 'Report Investment Fraud',
      buttonIcon: <DollarOutlined />,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: '#fff3e0'
    },
    {
      icon: <MessageOutlined className="text-4xl" style={{ color: '#9b59b6' }} />,
      title: 'Report SMS/WhatsApp Scam',
      description: 'Received fraudulent text messages or WhatsApp scams claiming prizes, fake job offers, or requesting money transfers? Report these mobile-based scams to prevent their spread.',
      details: 'Mobile scams often use urgent language, fake prize notifications, or impersonate friends and family members in distress. They may ask you to click malicious links or send money immediately.',
      buttonText: 'Report Mobile Scam',
      buttonIcon: <WhatsAppOutlined />,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: '#f3e5f5'
    },
    {
      icon: <UserOutlined className="text-4xl" style={{ color: '#2980b9' }} />,
      title: 'Report Identity Theft',
      description: 'Suspect someone is using your personal information fraudulently or impersonating you online? Report identity theft incidents to protect your reputation and financial security.',
      details: 'Identity thieves may use your personal information to open accounts, make purchases, or commit crimes in your name. Early reporting is crucial to minimize damage and restore your identity.',
      buttonText: 'Report Identity Theft',
      buttonIcon: <UserOutlined />,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: '#e3f2fd'
    },
    {
      icon: <PhoneOutlined className="text-4xl" style={{ color: '#27ae60' }} />,
      title: 'Report Phone Scam',
      description: 'Received suspicious phone calls claiming to be from banks, government agencies, or tech support asking for sensitive information? Report these voice-based scams immediately.',
      details: 'Phone scammers often use caller ID spoofing to appear legitimate. They may claim your account is compromised, threaten legal action, or offer fake technical support to gain access to your information.',
      buttonText: 'Report Phone Scam',
      buttonIcon: <PhoneOutlined />,
      gradient: 'from-green-500 to-green-600',
      bgColor: '#e8f5e8'
    },
    {
      icon: <GlobalOutlined className="text-4xl" style={{ color: '#34495e' }} />,
      title: 'Report Other Scams',
      description: 'Encountered any other type of digital fraud or suspicious online activity not covered above? Use this option to report any other scam attempts or cybersecurity threats.',
      details: 'This includes online shopping scams, fake charity requests, romance scams, business email compromise, or any other fraudulent activity you\'ve encountered online or through digital channels.',
      buttonText: 'Report Other Scam',
      buttonIcon: <BugOutlined />,
      gradient: 'from-gray-500 to-gray-600',
      bgColor: '#f5f5f5'
    }
  ]

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Hero Section */}
        <section className="bg-white text-dark py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <Title level={1} className="mb-6" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2980B9' }}>
                Report <span style={{ color: '#1A5276' }}>Digital Scams</span>
              </Title>
              <Paragraph className="text-lg mb-8 leading-relaxed max-w-4xl mx-auto" style={{ color: '#1A5276' }}>
                Help protect the Rwandan digital community by reporting scams and fraudulent activities. 
                Your reports help us improve our AI detection systems and warn others about emerging threats. 
                All reports are handled confidentially and contribute to building a safer digital environment for everyone.
              </Paragraph>
              
              <div 
                className="rounded-2xl p-6 max-w-2xl mx-auto"
                style={{
                  backgroundColor: '#EBF5FB',
                  boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)'
                }}
              >
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold mb-1" style={{ color: '#1A5276' }}>24/7</div>
                    <div className="text-sm" style={{ color: '#2980B9' }}>Reporting Available</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold mb-1" style={{ color: '#1A5276' }}>100%</div>
                    <div className="text-sm" style={{ color: '#2980B9' }}>Confidential</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold mb-1" style={{ color: '#1A5276' }}>AI</div>
                    <div className="text-sm" style={{ color: '#2980B9' }}>Enhanced Detection</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Report Cards Section */}
        <section className="py-16" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Title level={2} className="text-4xl font-bold mb-6" style={{ color: '#1A5276' }}>
                Choose Report Type
              </Title>
              <Paragraph className="text-lg max-w-3xl mx-auto" style={{ color: '#1A5276' }}>
                Select the type of scam or fraudulent activity you want to report. Each category helps us better understand and combat specific threats.
              </Paragraph>
            </motion.div>

            <Row gutter={[32, 32]}>
              {reportCards.map((card, index) => (
                <Col xs={24} lg={12} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  >
                    <Card
                      className="h-full"
                      style={{
                        borderRadius: '20px',
                        backgroundColor: card.bgColor,
                        border: '1px solid rgba(174, 214, 241, 0.3)',
                        boxShadow: '0 6px 20px rgba(26, 82, 118, 0.15)'
                      }}
                    >
                      <div className="text-center mb-6">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                          className="mb-4"
                        >
                          {card.icon}
                        </motion.div>
                        <Title level={3} className="mb-4" style={{ color: '#1A5276' }}>
                          {card.title}
                        </Title>
                      </div>

                      <div className="mb-6">
                        <Paragraph className="text-base leading-relaxed mb-4" style={{ color: '#1A5276' }}>
                          {card.description}
                        </Paragraph>
                        <Paragraph className="text-sm leading-relaxed" style={{ color: '#5D6D7E' }}>
                          {card.details}
                        </Paragraph>
                      </div>

                      <div className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="primary"
                            size="large"
                            icon={card.buttonIcon}
                            className="font-semibold px-8 py-3 h-auto w-full"
                            style={{ 
                              background: `linear-gradient(135deg, ${card.gradient.split(' ')[0].replace('from-', '')}, ${card.gradient.split(' ')[2].replace('to-', '')})`,
                              border: 'none',
                              borderRadius: '12px',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                            onClick={() => {
                              // Handle report action here
                              console.log(`Reporting: ${card.title}`)
                            }}
                          >
                            {card.buttonText}
                          </Button>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Emergency Contact Section */}
        <section className="py-16 bg-gradient-to-br from-[#EBF5FB] to-[#AED6F1]">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Title level={2} className="text-3xl font-bold mb-6" style={{ color: '#1A5276' }}>
                Need Immediate Help?
              </Title>
              <Paragraph className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#1A5276' }}>
                If you're currently being targeted by a scam or have already been victimized, 
                contact the authorities immediately or reach out to our emergency support channels.
              </Paragraph>
              
              <Space size="large" className="flex flex-col sm:flex-row justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PhoneOutlined />}
                    className="font-semibold px-8 py-3 h-auto"
                    style={{ 
                      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                      border: 'none',
                      borderRadius: '12px'
                    }}
                  >
                    Emergency: 112
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="default"
                    size="large"
                    icon={<WhatsAppOutlined />}
                    className="font-semibold px-8 py-3 h-auto"
                    style={{ 
                      backgroundColor: '#25D366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px'
                    }}
                  >
                    WhatsApp Support
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="default"
                    size="large"
                    icon={<SafetyOutlined />}
                    className="font-semibold px-8 py-3 h-auto"
                    style={{ 
                      backgroundColor: '#2980B9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px'
                    }}
                  >
                    Cyber Crime Unit
                  </Button>
                </motion.div>
              </Space>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}