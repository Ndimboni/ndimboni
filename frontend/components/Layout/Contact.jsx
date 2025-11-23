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
  GithubOutlined,
  WhatsAppOutlined,
  TwitterOutlined,
  LinkedinOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input
const { Option } = Select


const ContactCategory = {
  GENERAL_INQUIRY: 'general_inquiry',
  TECHNICAL_SUPPORT: 'technical_support',
  SCAM_REPORT: 'scam_report',
  FEATURE_REQUEST: 'feature_request',
  BUG_REPORT: 'bug_report',
  OTHER: 'other'
}

import { siteConfig } from '../../config/site'
export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: ContactCategory.GENERAL_INQUIRY
  })

  const contactInfo = [
    {
      icon: <MailOutlined className="text-2xl" />,
      title: 'Email Us',
      content: siteConfig.contact.email,
      subtitle: 'Get support within 24 hrs',
      color: '#2980B9'
    },
    {
      icon: <PhoneOutlined className="text-2xl" />,
      title: 'Call Us',
      content: siteConfig.contact.phone,
      subtitle: 'Mon-Fri, 8AM-6PM EAT',
      color: '#1A5276'
    },
    {
      icon: <EnvironmentOutlined className="text-2xl" />,
      title: 'Visit Us',
      content: siteConfig.contact.address,
      subtitle: 'University of Rwanda CST-Campus',
      color: '#2980B9'
    },
    {
      icon: <WhatsAppOutlined className="text-2xl" />,
      title: 'WhatsApp',
      content: siteConfig.contact.phone, // Assuming same phone for now, or add whatsapp to config
      subtitle: 'Quick scam reporting',
      color: '#25D366'
    }
  ]


const openSocialMedia = (platform) => {
  const socialLinks = {
    twitter: siteConfig.socials.twitter,
    linkedin: siteConfig.socials.linkedin,
    whatsapp: `https://wa.me/${siteConfig.contact.phone.replace(/[^0-9]/g, '')}`,
    github: `https://github.com/${siteConfig.contact.phone.replace(/[^0-9]/g, '')}`
  }
  
  if (socialLinks[platform]) {
    window.open(socialLinks[platform], '_blank', 'noopener,noreferrer')
  }
}

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Emergency Only' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    const errors = []
    
    if (!formData.name.trim()) errors.push('Name is required')
    if (!formData.email.trim()) errors.push('Email is required')
    if (!formData.subject.trim()) errors.push('Subject is required')
    if (!formData.message.trim()) errors.push('Message is required')
    

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address')
    }
    
   
    if (formData.name.length > 100) errors.push('Name must be less than 100 characters')
    if (formData.phone && formData.phone.length > 20) errors.push('Phone must be less than 20 characters')
    if (formData.subject.length > 200) errors.push('Subject must be less than 200 characters')
    if (formData.message.length > 2000) errors.push('Message must be less than 2000 characters')
    
    return errors
  }

  const submitForm = async () => {
    const errors = validateForm()
    
    if (errors.length > 0) {
      errors.forEach(error => message.error(error))
      return
    }

    setLoading(true)
    
    try {
   
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined, 
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        category: formData.category
      }

      if (!submitData.phone) {
        delete submitData.phone
      }

   
      const response = await fetch('https://ndimboniapi.ini.rw/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit contact form')
      }

      const result = await response.json()
      
      message.success('Your message has been sent successfully! We will get back to you soon.')
      
     
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: ContactCategory.GENERAL_INQUIRY
      })
      
    } catch (error) {
      console.error('Contact form submission error:', error)
      message.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
                Contact <span style={{ color: '#2980B9' }}>{siteConfig.name}</span>
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
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Full Name *
                        </label>
                        <Input 
                          prefix={<UserOutlined style={{ color: '#2980B9' }} />}
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          maxLength={100}
                          style={{ borderRadius: '12px' }}
                        />
                        <Text type="secondary" className="text-xs">
                          {formData.name.length}/100 characters
                        </Text>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Email Address *
                        </label>
                        <Input 
                          prefix={<MailOutlined style={{ color: '#2980B9' }} />}
                          placeholder="Enter your email address"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          style={{ borderRadius: '12px' }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Phone Number (Optional)
                        </label>
                        <Input 
                          prefix={<PhoneOutlined style={{ color: '#2980B9' }} />}
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          maxLength={20}
                          style={{ borderRadius: '12px' }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Category *
                        </label>
                        <Select 
                          placeholder="Select a category"
                          value={formData.category}
                          onChange={(value) => handleInputChange('category', value)}
                          style={{ borderRadius: '12px', width: '100%' }}
                        >
                          <Option value={ContactCategory.SCAM_REPORT}>Report a Scam</Option>
                          <Option value={ContactCategory.GENERAL_INQUIRY}>General Inquiry</Option>
                          <Option value={ContactCategory.TECHNICAL_SUPPORT}>Technical Support</Option>
                          <Option value={ContactCategory.FEATURE_REQUEST}>Feature Request</Option>
                          <Option value={ContactCategory.BUG_REPORT}>Bug Report</Option>
                          <Option value={ContactCategory.OTHER}>Other</Option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Subject *
                        </label>
                        <Input 
                          placeholder="Enter the subject of your message"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          maxLength={200}
                          style={{ borderRadius: '12px' }}
                        />
                        <Text type="secondary" className="text-xs">
                          {formData.subject.length}/200 characters
                        </Text>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A5276' }}>
                          Message *
                        </label>
                        <TextArea 
                          rows={6}
                          placeholder="Tell us how we can help you..."
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          maxLength={2000}
                          style={{ borderRadius: '12px' }}
                          showCount
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
                          onClick={submitForm}
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
      onClick={() => openSocialMedia('twitter')}
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
      onClick={() => openSocialMedia('linkedin')}
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
      onClick={() => openSocialMedia('whatsapp')}
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
      icon={<GithubOutlined/>}
      onClick={() => openSocialMedia('github')}
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