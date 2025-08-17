'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Database, 
  MessageSquare, 
  Search, 
  BookOpen, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  FileText,
  Bot,
  Globe
} from 'lucide-react';
import { useTranslation } from '../lib/i18n/context';
import LoginModal from './LoginModal';
import { login } from '../lib/auth';

export default function LandingPage() {
  const { t } = useTranslation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      await login(username, password);
      setIsLoginOpen(false);
      // 登入成功後重新載入頁面以更新導航狀態
      window.location.reload();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : t('auth.loginError'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: t('landing.features.intelligentQA.title'),
      description: t('landing.features.intelligentQA.description'),
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Database,
      title: t('landing.features.vectorStore.title'),
      description: t('landing.features.vectorStore.description'),
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Search,
      title: t('landing.features.hybridSearch.title'),
      description: t('landing.features.hybridSearch.description'),
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: MessageSquare,
      title: t('landing.features.realTimeChat.title'),
      description: t('landing.features.realTimeChat.description'),
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      icon: Shield,
      title: t('landing.features.enterpriseSecurity.title'),
      description: t('landing.features.enterpriseSecurity.description'),
      color: 'text-red-600 bg-red-100'
    },
    {
      icon: Zap,
      title: t('landing.features.easyIntegration.title'),
      description: t('landing.features.easyIntegration.description'),
      color: 'text-yellow-600 bg-yellow-100'
    }
  ];

  const stats = [
    { label: t('landing.stats.accuracy'), value: '99.8%' },
    { label: t('landing.stats.responseTime'), value: '<100ms' },
    { label: t('landing.stats.languages'), value: '30+' },
    { label: t('landing.stats.uptime'), value: '99.9%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo with AI Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {t('landing.hero.title')}
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                {t('landing.hero.getStarted')}
              </button>
              
              <Link 
                href="/knowledge-base"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-purple-600 hover:text-purple-600 transition-all duration-200 flex items-center justify-center"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {t('landing.hero.exploreKnowledgeBase')}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl group">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base Preview Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {t('landing.knowledgeBase.title')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('landing.knowledgeBase.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  {[
                    {
                      icon: FileText,
                      title: t('landing.knowledgeBase.features.upload'),
                      description: t('landing.knowledgeBase.features.uploadDesc')
                    },
                    {
                      icon: Bot,
                      title: t('landing.knowledgeBase.features.ai'),
                      description: t('landing.knowledgeBase.features.aiDesc')
                    },
                    {
                      icon: Globe,
                      title: t('landing.knowledgeBase.features.multilingual'),
                      description: t('landing.knowledgeBase.features.multilingualDesc')
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link 
                    href="/knowledge-base"
                    className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                  >
                    {t('landing.knowledgeBase.cta')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <div className="h-3 bg-purple-200 rounded w-24"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {t('landing.cta.button')}
          </button>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        error={loginError}
        isLoading={isLoggingIn}
      />
    </div>
  );
}
