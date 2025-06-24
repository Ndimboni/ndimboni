import React, { useState, useEffect } from 'react';
import { BookOpen, Shield, Users, Lightbulb, ExternalLink, Modal, Clock, Tag, ArrowRight, Search, Filter, AlertCircle, Loader2, GraduationCap, Target, Heart } from 'lucide-react';
import { Modal as AntModal, Select, Input, Button, Space, message } from 'antd';

const { TextArea } = Input;
const { Option } = Select;
const API_BASE_URL1 = 'https://ndimboniapi.ini.rw/api/scammer-reports';

const apiCalls = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL1}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };

    if (options.body && (config.method === 'POST' || config.method === 'PUT')) {
      config.body = JSON.stringify(options.body);
    }

    console.log('API Call:', {
      url: url,
      method: config.method,
      headers: config.headers,
      body: config.body
    });

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

const ScammerType = {
  EMAIL: 'email',
  PHONE: 'phone',
  SOCIAL_MEDIA: 'social_media',
  WEBSITE: 'website',
  OTHER: 'other'
};

const Education = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredResources, setFilteredResources] = useState([]);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    type: '',
    identifier: '',
    description: '',
    additionalInfo: '',
    source: 'web'
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://ndimboniapi.ini.rw/education-resources/published');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setResources(data);
        setFilteredResources(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load education resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    let filtered = resources;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.category && resource.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => 
        resource.category && resource.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredResources(filtered);
  }, [searchTerm, selectedCategory, resources]);

  const categories = [...new Set(resources.map(r => r.category).filter(Boolean))];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleResourceClick = (resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenReportModal = () => {
    setReportModalVisible(true);
  };

 const submitReport = async (formData) => {
  setIsSubmittingReport(true);
  try {
 
    if (!formData.type || !formData.identifier || !formData.description) {
      message.error('Please fill in all required fields');
      return;
    }

    if (formData.description.length < 10) {
      message.error('Description must be at least 10 characters');
      return;
    }

    
    const requestData = {
      type: formData.type,
      identifier: formData.identifier.trim(),
      description: formData.description.trim(),
      additionalInfo: formData.additionalInfo ? formData.additionalInfo.trim() : undefined,
      source: formData.source || 'web'
    };

   
    Object.keys(requestData).forEach(key => {
      if (requestData[key] === undefined || requestData[key] === '') {
        delete requestData[key];
      }
    });

    console.log('Submitting report:', requestData);

    const response = await apiCalls('/report', {
      method: 'POST',
      body: requestData
    });
    
    if (response.success || response.data) {
      message.success('Scammer reported successfully');
      setReportModalVisible(false);
      setReportFormData({
        type: '',
        identifier: '',
        description: '',
        additionalInfo: '',
        source: 'web'
      });
    
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Submit report error:', error);
    message.error(`Failed to report scammer: ${error.message}`);
  } finally {
    setIsSubmittingReport(false);
  }
};

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #EBF5FB, #AED6F1)' }}>
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-animation {
          animation: gradientShift 8s ease infinite;
        }
      `}</style>
      
      {/* Hero Section */}
      <div className="relative text-white py-20 overflow-hidden gradient-animation" style={{ 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82f6 100%)',
        backgroundSize: '400% 400%'
      }}>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/2 right-20 w-48 h-48 bg-blue-300/10 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-indigo-300/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
          `
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Digital Security Education
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: '#AED6F1' }}>
              Empowering Rwandans with knowledge to identify, prevent, and report digital scam
            </p>
            <div className="flex flex-wrap justify-center gap-6" style={{ color: '#AED6F1' }}>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>Scam Prevention</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Community Safety</span>
              </div>
              <div className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                <span>Interactive Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-10 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="rounded-full p-4 mb-4" style={{ backgroundColor: '#EBF5FB' }}>
                  <BookOpen className="w-8 h-8" style={{ color: '#2980B9' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#1A5276' }}>{resources.length}+</h3>
                <p style={{ color: '#5d6d7e' }}>Educational Resources</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-full p-4 mb-4" style={{ backgroundColor: '#D5EDDA' }}>
                  <Target className="w-8 h-8" style={{ color: '#28A745' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#1A5276' }}>24/7</h3>
                <p style={{ color: '#5d6d7e' }}>Protection Available</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-full p-4 mb-4" style={{ backgroundColor: '#F3E5F5' }}>
                  <Heart className="w-8 h-8" style={{ color: '#8E44AD' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#1A5276' }}>Local</h3>
                <p style={{ color: '#5d6d7e' }}>Rwanda-Focused Content</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6" style={{ border: '1px solid rgba(174, 214, 241, 0.3)' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A5276' }}>Explore Resources</h2>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#2980B9' }} />
                <input
                  type="text"
                  placeholder="Search for scam types, prevention tips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 outline-none transition-all"
                  style={{ 
                    border: '1px solid #AED6F1',
                    focusRingColor: '#2980B9',
                    focusBorderColor: '#2980B9'
                  }}
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#2980B9' }} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 rounded-lg focus:ring-2 outline-none bg-white min-w-[200px] transition-all"
                  style={{ 
                    border: '1px solid #AED6F1',
                    focusRingColor: '#2980B9',
                    focusBorderColor: '#2980B9'
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between">
              <span style={{ color: '#5d6d7e' }}>
                Showing <span className="font-semibold" style={{ color: '#2980B9' }}>{filteredResources.length}</span> of <span className="font-semibold">{resources.length}</span> resources
              </span>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#2980B9' }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-xl p-6" style={{ backgroundColor: '#FFE5E5', border: '1px solid #FFB3B3' }}>
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: '#C0392B' }} />
              <div>
                <h3 className="font-semibold" style={{ color: '#C0392B' }}>Unable to Load Resources</h3>
                <p className="mt-1" style={{ color: '#A93226' }}>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 font-medium text-sm underline"
                  style={{ color: '#C0392B' }}
                >
                  Try refreshing the page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredResources.length === 0 && !loading && !error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="max-w-md mx-auto">
              <BookOpen className="w-16 h-16 mx-auto mb-6" style={{ color: '#AED6F1' }} />
              <h3 className="text-2xl font-semibold mb-4" style={{ color: '#1A5276' }}>
                {searchTerm || selectedCategory !== 'all' ? 'No Matching Resources' : 'No Resources Available'}
              </h3>
              <p className="mb-6" style={{ color: '#5d6d7e' }}>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search terms or explore different categories.' 
                  : 'Educational resources will appear here once they are published by our team.'}
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ 
                    backgroundColor: '#2980B9',
                    ':hover': { backgroundColor: '#1A5276' }
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1A5276'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2980B9'}
                >
                  View All Resources
                </button>
              )}
            </div>
          </div>
        )}

        {/* Resources Grid */}
        {filteredResources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group cursor-pointer"
                style={{ border: '1px solid rgba(174, 214, 241, 0.2)' }}
                onClick={() => handleResourceClick(resource)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2980B9, #1A5276)' }}>
                  {resource.imageUrl ? (
                    <img
                      src={resource.imageUrl}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center" 
                       style={{ 
                         display: resource.imageUrl ? 'none' : 'flex', 
                         background: 'linear-gradient(135deg, #2980B9, #1A5276)' 
                       }}>
                    <BookOpen className="w-16 h-16 text-white/80" />
                  </div>
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  {resource.category && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-sm"
                            style={{ color: '#1A5276' }}>
                        <Tag className="w-3 h-3 mr-1" />
                        {resource.category}
                      </span>
                    </div>
                  )}

                  {/* External Link Indicator */}
                  {resource.url && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-sm group-hover:scale-110 transition-transform">
                        <ExternalLink className="w-4 h-4" style={{ color: '#2980B9' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight"
                      style={{ color: '#1A5276' }}>
                    {resource.title}
                  </h3>
                  
                  <p className="mb-4 line-clamp-3 leading-relaxed" style={{ color: '#5d6d7e' }}>
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center" style={{ color: '#7f8c8d' }}>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDate(resource.createdAt)}</span>
                    </div>
                    
                    {resource.url && (
                      <div className="flex items-center font-semibold transition-colors" 
                           style={{ color: '#2980B9' }}>
                        <span className="mr-1">Learn More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action Section */}
        <div className="mt-20 rounded-2xl p-8 md:p-12 text-white text-center shadow-2xl"
             style={{ background: 'linear-gradient(135deg, #2980B9, #1A5276)' }}>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#AED6F1' }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Protected, Stay Informed</h2>
            <p className="text-xl mb-8 leading-relaxed" style={{ color: '#AED6F1' }}>
              Knowledge is your strongest defense against digital scams. Explore our resources, stay updated with the latest threats, and help protect your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">               
              <button 
                className="bg-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-blue-50 cursor-pointer"
                style={{ color: '#2980B9' }}
                onClick={handleOpenReportModal}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#EBF5FB';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}>
                <AlertCircle className="w-5 h-5 mr-2" />
                Report a Scam
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Scammer Modal  */}
      <AntModal
        title="Report a Scammer"
        open={reportModalVisible}
        onCancel={() => {
          setReportModalVisible(false);
          setReportFormData({
            type: '',
            identifier: '',
            description: '',
            additionalInfo: '',
            source: 'web'
          });
        }}
        footer={null}
        width={600}
      >
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Scam Type *
            </label>
            <Select 
              placeholder="Select scam type" 
              style={{ width: '100%' }}
              value={reportFormData.type}
              onChange={(value) => setReportFormData(prev => ({ ...prev, type: value }))}
            >
              <Option value={ScammerType.EMAIL}>Email</Option>
              <Option value={ScammerType.PHONE}>Phone</Option>
              <Option value={ScammerType.SOCIAL_MEDIA}>Social Media</Option>
              <Option value={ScammerType.WEBSITE}>Website</Option>
              <Option value={ScammerType.OTHER}>Other</Option>
            </Select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Contact Information *
            </label>
            <Input 
              placeholder="Enter email, phone, username, or website"
              value={reportFormData.identifier}
              onChange={(e) => setReportFormData(prev => ({ ...prev, identifier: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description *
            </label>
            <TextArea
              rows={4}
              placeholder="Describe how this scammer tried to deceive you..."
              value={reportFormData.description}
              onChange={(e) => setReportFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Additional Information
            </label>
            <TextArea
              rows={3}
              placeholder="Any additional details about this scammer..."
              value={reportFormData.additionalInfo}
              onChange={(e) => setReportFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setReportModalVisible(false);
                setReportFormData({
                  type: '',
                  identifier: '',
                  description: '',
                  additionalInfo: '',
                  source: 'web'
                });
              }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                onClick={() => submitReport(reportFormData)}
                loading={isSubmittingReport} 
                disabled={isSubmittingReport}
              >
                Report Scammer
              </Button>
            </Space>
          </div>
        </div>
      </AntModal>
    </div>
  );
};

export default Education;