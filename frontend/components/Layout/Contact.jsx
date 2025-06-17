import { useState } from 'react'
import { Typography, Button, Row, Col, Card, Input, Select, Space, message } from 'antd'
import { 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  WhatsAppOutlined,
  TwitterOutlined,
  LinkedinOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input
const { Option } = Select

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  const contactInfo = [
    {
      icon: <MailOutlined className="text-2xl" />,
      title: 'Email Us',
      content: 'support@ndimboni.rw',
      subtitle: 'Get support within 24 hrs',
      color: '#2980B9'
    },
    {
      icon: <PhoneOutlined className="text-2xl" />,
      title: 'Call Us',
      content: '+250 783 447 260',
      subtitle: 'Mon-Fri, 8AM-6PM EAT',
      color: '#1A5276'
    },
    {
      icon: <EnvironmentOutlined className="text-2xl" />,
      title: 'Visit Us',
      content: 'Kigali, Rwanda',
      subtitle: 'University of Rwanda CST-Campus',
      color: '#2980B9'
    },
    {
      icon: <WhatsAppOutlined className="text-2xl" />,
      title: 'WhatsApp',
      content: '+250 784 310 609',
      subtitle: 'Quick scam reporting',
      color: '#25D366'
    }
  ]

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Emergency Only' }
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Hero Section */}
        <section className="bg-white text-dark py-6">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center px-4 py-2 bg-[#AED6F1] rounded-full text-[#1A5276] font-semibold text-sm mb-6">
                <MessageOutlined className="mr-2" />
                Get In Touch
              </div>
              
              <Title level={1} className="mb-6" style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#1A5276' }}>
                Contact <span style={{ color: '#2980B9' }}>Ndimboni</span>
              </Title>
              
              <Paragraph className="text-lg mb-8 leading-relaxed" style={{ color: '#1A5276' }}>
                Have questions about digital scam protection? Need to report a suspicious activity? 
                Our expert team is here to help keep you safe online.
              </Paragraph>
            </motion.div>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-7 bg-gradient-to-br from-[#EBF5FB] to-[#AED6F1]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  <Card
                    className="h-full text-center border-0 transition-all duration-300"
                    style={{ 
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 20px rgba(26, 82, 118, 0.1)'
                    }}
                  >
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="mb-4"
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
                        style={{ backgroundColor: info.color }}
                      >
                        {info.icon}
                      </div>
                    </motion.div>
                    
                    <Title level={4} className="mb-2" style={{ color: '#1A5276' }}>
                      {info.title}
                    </Title>
                    
                    <Text className="block text-sm font-semibold mb-1" style={{ color: '#2980B9' }}>
                      {info.content}
                    </Text>
                    
                    <Text className="text-sm" style={{ color: '#7f8c8d' }}>
                      {info.subtitle}
                    </Text>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form and Information */}
        <section className="py-6">
          <div className="container mx-auto px-6">
            <Row gutter={[48, 48]} align="top">
              
              {/* Contact Form */}
              <Col xs={24} lg={14}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className="shadow-lg border-0"
                    style={{ 
                      borderRadius: '24px',
                      backgroundColor: '#EBF5FB',
                      border: '1px solid rgba(174, 214, 241, 0.3)'
                    }}
                  >
                    <div className="mb-8">
                      <Title level={3} style={{ color: '#1A5276' }}>
                        Send Us a Message
                      </Title>
                      <Paragraph style={{ color: '#5d6d7e' }}>
                        Fill out the form below and we'll get back to you as soon as possible.
                      </Paragraph>
                    </div>

                    <div className="space-y-6">
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                              First Name *
                            </label>
                            <Input 
                              prefix={<UserOutlined style={{ color: '#2980B9' }} />}
                              placeholder="Enter your first name"
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                        </Col>
                        <Col xs={24} md={12}>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                              Last Name *
                            </label>
                            <Input 
                              prefix={<UserOutlined style={{ color: '#2980B9' }} />}
                              placeholder="Enter your last name"
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                        </Col>
                      </Row>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Email Address *
                        </label>
                        <Input 
                          prefix={<MailOutlined style={{ color: '#2980B9' }} />}
                          placeholder="Enter your email address"
                          style={{ borderRadius: '12px' }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Phone Number
                        </label>
                        <Input 
                          prefix={<PhoneOutlined style={{ color: '#2980B9' }} />}
                          placeholder="Enter your phone number"
                          style={{ borderRadius: '12px' }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Subject *
                        </label>
                        <Select 
                          placeholder="Select a subject"
                          style={{ borderRadius: '12px', width: '100%' }}
                        >
                          <Option value="scam-report">Report a Scam</Option>
                          <Option value="general-inquiry">General Inquiry</Option>
                          <Option value="technical-support">Technical Support</Option>
                          <Option value="partnership">Partnership</Option>
                          <Option value="feedback">Feedback</Option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Message *
                        </label>
                        <TextArea 
                          rows={6}
                          placeholder="Tell us how we can help you..."
                          style={{ borderRadius: '12px' }}
                        />
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="primary"
                          loading={loading}
                          icon={<SendOutlined />}
                          size="large"
                          className="w-full font-semibold h-12"
                          style={{ 
                            background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                            borderRadius: '12px',
                            border: 'none'
                          }}
                          onClick={() => {
                            setLoading(true)
                            setTimeout(() => {
                              setLoading(false)
                              message.success('Your message has been sent successfully! We will get back to you soon.')
                            }, 2000)
                          }}
                        >
                          Send Message
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              </Col>

              {/* Additional Information */}
              <Col xs={24} lg={10}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  
                  {/* Office Hours */}
                  <Card
                    className="shadow-md border-0"
                    style={{ 
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(174, 214, 241, 0.2)'
                    }}
                  >
                    <div className="flex items-center mb-4">
                      <ClockCircleOutlined className="text-2xl mr-3" style={{ color: '#2980B9' }} />
                      <Title level={4} className="mb-0" style={{ color: '#1A5276' }}>
                        Office Hours
                      </Title>
                    </div>
                    
                    <div className="space-y-3">
                      {officeHours.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <Text style={{ color: '#1A5276', fontWeight: '500' }}>
                            {schedule.day}
                          </Text>
                          <Text style={{ color: '#2980B9', fontWeight: '600' }}>
                            {schedule.hours}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Emergency Contact */}
                  <Card
                    className="shadow-md border-0"
                    style={{ 
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #FFE5E5, #FFB3B3)',
                      border: '1px solid rgba(231, 76, 60, 0.2)'
                    }}
                  >
                    <Title level={4} className="mb-3" style={{ color: '#C0392B' }}>
                      🚨 Emergency Scam Alert
                    </Title>
                    <Paragraph className="mb-4" style={{ color: '#A93226' }}>
                      If you've been scammed or suspect immediate fraud, contact us immediately:
                    </Paragraph>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <PhoneOutlined className="mr-2" style={{ color: '#C0392B' }} />
                        <Text strong style={{ color: '#C0392B' }}>+250 783-447-260 (URGENT) </Text>
                      </div>
                      <div className="flex items-center">
                        <WhatsAppOutlined className="mr-2" style={{ color: '#25D366' }} />
                        <Text strong style={{ color: '#C0392B' }}>WhatsApp: +250 784 310 609</Text>
                      </div>
                    </div>
                  </Card>

                  {/* Social Media */}
                  <Card
                    className="shadow-md border-0"
                    style={{ 
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(174, 214, 241, 0.2)'
                    }}
                  >
                    <Title level={4} className="mb-4" style={{ color: '#1A5276' }}>
                      Follow Us
                    </Title>
                    
                    <Space size="large">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          shape="circle"
                          size="large"
                          icon={<TwitterOutlined />}
                          style={{ 
                            backgroundColor: '#1DA1F2',
                            color: 'white',
                            border: 'none'
                          }}
                        />
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          shape="circle"
                          size="large"
                          icon={<LinkedinOutlined />}
                          style={{ 
                            backgroundColor: '#0077B5',
                            color: 'white',
                            border: 'none'
                          }}
                        />
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          shape="circle"
                          size="large"
                          icon={<WhatsAppOutlined />}
                          style={{ 
                            backgroundColor: '#25D366',
                            color: 'white',
                            border: 'none'
                          }}
                        />
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          shape="circle"
                          size="large"
                          icon={<GlobalOutlined />}
                          style={{ 
                            backgroundColor: '#2980B9',
                            color: 'white',
                            border: 'none'
                          }}
                        />
                      </motion.div>
                    </Space>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-6" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Title level={3} className="mb-8" style={{ color: '#1A5276' }}>
                Need Quick Answers?
              </Title>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div whileHover={{ y: -5 }}>
                  <Card
                    className="text-center cursor-pointer border-0 hover:shadow-lg transition-all duration-300"
                    style={{ borderRadius: '16px' }}
                  >
                    <Title level={5} style={{ color: '#2980B9' }}>How to Report?</Title>
                    <Text style={{ color: '#5d6d7e' }}>Learn the fastest way to report scams</Text>
                  </Card>
                </motion.div>
                
                <motion.div whileHover={{ y: -5 }}>
                  <Card
                    className="text-center cursor-pointer border-0 hover:shadow-lg transition-all duration-300"
                    style={{ borderRadius: '16px' }}
                  >
                    <Title level={5} style={{ color: '#2980B9' }}>Common Scams</Title>
                    <Text style={{ color: '#5d6d7e' }}>Identify the most common digital scams</Text>
                  </Card>
                </motion.div>
                
                <motion.div whileHover={{ y: -5 }}>
                  <Card
                    className="text-center cursor-pointer border-0 hover:shadow-lg transition-all duration-300"
                    style={{ borderRadius: '16px' }}
                  >
                    <Title level={5} style={{ color: '#2980B9' }}>Stay Protected</Title>
                    <Text style={{ color: '#5d6d7e' }}>Tips to keep yourself safe online</Text>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  )
}