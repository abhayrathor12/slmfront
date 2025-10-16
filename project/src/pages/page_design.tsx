import { useEffect, useState } from 'react';
import { Palette, Type, Video, Layout, Copy, Eye, EyeOff } from 'lucide-react';
import { generateLayout1HTML } from '../layouts/layout1';
import { generateLayout2HTML } from '../layouts/layout2';

const PageDesign = () => {
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  
  // Text content states
  const [headerText, setHeaderText] = useState('Your Amazing Heading');
  const [sectionTitle, setSectionTitle] = useState('Featured Content');
  const [mainTitle, setMainTitle] = useState('Welcome to Our Platform');
  const [introText, setIntroText] = useState('Discover amazing features and capabilities that will transform your experience.');
  const [point1Title, setPoint1Title] = useState('Innovation');
  const [point1Desc, setPoint1Desc] = useState('Cutting-edge solutions designed for modern needs.');
  const [point2Title, setPoint2Title] = useState('Excellence');
  const [point2Desc, setPoint2Desc] = useState('Quality and precision in every detail.');
  
  // Color states for Layout 1
  const [headerBgColor, setHeaderBgColor] = useState('#203f78');
  const [headerTextColor, setHeaderTextColor] = useState('#ffffff');
  const [sectionBgColor, setSectionBgColor] = useState('#ffffff');
  const [sectionTitleColor, setSectionTitleColor] = useState('#203f78');
  const [mainBgColor, setMainBgColor] = useState('#ffffff');
  const [mainTitleColor, setMainTitleColor] = useState('#203f78');
  const [mainBorderColor, setMainBorderColor] = useState('#203f78');
  const [introBgColor, setIntroBgColor] = useState('#f0f4ff');
  const [introTextColor, setIntroTextColor] = useState('#1a1a1a');
  const [cardBgColor, setCardBgColor] = useState('#203f78');
  const [cardTextColor, setCardTextColor] = useState('#ffffff');
  
  // Color states for Layout 2
  const [l2HeaderBg, setL2HeaderBg] = useState('#203f78');
  const [l2HeaderText, setL2HeaderText] = useState('#ffffff');
  const [l2SidebarBg, setL2SidebarBg] = useState('#f8f9fa');
  const [l2SidebarText, setL2SidebarText] = useState('#333333');
  const [l2MainBg, setL2MainBg] = useState('#ffffff');
  const [l2MainText, setL2MainText] = useState('#333333');
  const [l2FooterBg, setL2FooterBg] = useState('#2d3748');
  const [l2FooterText, setL2FooterText] = useState('#ffffff');
  const [l2BorderColor, setL2BorderColor] = useState('#e2e8f0');

  const handleCopy = () => {
    const html = selectedLayout === 'layout1' ? generateLayout1HTML({
      headerBgColor, headerTextColor, headerText, sectionBgColor, sectionTitleColor, sectionTitle,
      videoUrl, mainBgColor, mainTitleColor, mainTitle, mainBorderColor, introBgColor,
      introTextColor, introText, cardBgColor, cardTextColor, point1Title, point1Desc,
      point2Title, point2Desc
    }) : generateLayout2HTML({
      headerText, l2HeaderBg, l2HeaderText, l2SidebarBg, l2SidebarText, l2MainBg,
      l2MainText, l2FooterBg, l2FooterText, l2BorderColor, mainTitle, introText,
      point1Title, point1Desc, videoUrl, introBgColor
    });
    navigator.clipboard.writeText(html).then(() => {
      alert('✅ HTML content copied to clipboard!');
    }).catch(err => {
      alert('❌ Failed to copy: ' + err);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Page Designer Pro</h1>
                <p className="text-sm text-slate-600">Create beautiful layouts with full color control</p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Layout Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            Choose Layout Template
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedLayout('layout1')}
              className={`relative group overflow-hidden rounded-lg border-2 transition-all ${
                selectedLayout === 'layout1' 
                  ? 'border-blue-600 shadow-lg scale-105' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="w-40 h-40 bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex flex-col gap-2">
                <div className="bg-blue-600 h-8 rounded"></div>
                <div className="bg-slate-300 h-16 rounded"></div>
                <div className="flex gap-2">
                  <div className="bg-purple-600 h-12 rounded flex-1"></div>
                  <div className="bg-purple-600 h-12 rounded flex-1"></div>
                </div>
              </div>
              <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                <span className="text-slate-900 font-semibold">Hero Layout</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedLayout('layout2')}
              className={`relative group overflow-hidden rounded-lg border-2 transition-all ${
                selectedLayout === 'layout2' 
                  ? 'border-blue-600 shadow-lg scale-105' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="w-40 h-40 bg-gradient-to-br from-green-50 to-blue-50 p-4 flex flex-col gap-2">
                <div className="bg-green-600 h-8 rounded"></div>
                <div className="flex gap-2 flex-1">
                  <div className="bg-slate-300 w-12 rounded"></div>
                  <div className="bg-blue-600 flex-1 rounded"></div>
                </div>
                <div className="bg-slate-700 h-8 rounded"></div>
              </div>
              <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                <span className="text-slate-900 font-semibold">Grid Layout</span>
              </div>
            </button>
          </div>
        </div>

        {selectedLayout && (
          <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
            {/* Editor Panel */}
            <div className="space-y-6">
              {/* Video URL */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-600" />
                  Video URL
                </h3>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-green-600" />
                  Content
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Header Text</label>
                    <input
                      type="text"
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Section Title</label>
                    <input
                      type="text"
                      value={sectionTitle}
                      onChange={(e) => setSectionTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Main Title</label>
                    <input
                      type="text"
                      value={mainTitle}
                      onChange={(e) => setMainTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Intro Text</label>
                    <textarea
                      value={introText}
                      onChange={(e) => setIntroText(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Point 1 Title</label>
                      <input
                        type="text"
                        value={point1Title}
                        onChange={(e) => setPoint1Title(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Point 2 Title</label>
                      <input
                        type="text"
                        value={point2Title}
                        onChange={(e) => setPoint2Title(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Point 1 Description</label>
                    <textarea
                      value={point1Desc}
                      onChange={(e) => setPoint1Desc(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Point 2 Description</label>
                    <textarea
                      value={point2Desc}
                      onChange={(e) => setPoint2Desc(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Color Customization */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Color Customization
                </h3>
                
                {selectedLayout === 'layout1' ? (
                  <div className="space-y-6">
                    {/* Header Colors */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Header Section</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={headerBgColor}
                              onChange={(e) => setHeaderBgColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={headerBgColor}
                              onChange={(e) => setHeaderBgColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Text</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={headerTextColor}
                              onChange={(e) => setHeaderTextColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={headerTextColor}
                              onChange={(e) => setHeaderTextColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Colors */}
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Video Section</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={sectionBgColor}
                              onChange={(e) => setSectionBgColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={sectionBgColor}
                              onChange={(e) => setSectionBgColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Title Text</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={sectionTitleColor}
                              onChange={(e) => setSectionTitleColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={sectionTitleColor}
                              onChange={(e) => setSectionTitleColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Colors */}
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Main Content</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={mainBgColor}
                              onChange={(e) => setMainBgColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={mainBgColor}
                              onChange={(e) => setMainBgColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Title Text</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={mainTitleColor}
                              onChange={(e) => setMainTitleColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={mainTitleColor}
                              onChange={(e) => setMainTitleColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Border</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={mainBorderColor}
                              onChange={(e) => setMainBorderColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={mainBorderColor}
                              onChange={(e) => setMainBorderColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Intro Box Colors */}
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Intro Box</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={introBgColor}
                              onChange={(e) => setIntroBgColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={introBgColor}
                              onChange={(e) => setIntroBgColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Text</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={introTextColor}
                              onChange={(e) => setIntroTextColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={introTextColor}
                              onChange={(e) => setIntroTextColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Colors */}
                    <div className="border-l-4 border-pink-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Feature Cards</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={cardBgColor}
                              onChange={(e) => setCardBgColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={cardBgColor}
                              onChange={(e) => setCardBgColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Text</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={cardTextColor}
                              onChange={(e) => setCardTextColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={cardTextColor}
                              onChange={(e) => setCardTextColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Layout 2 Header Colors */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Header</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={l2HeaderBg}
                              onChange={(e) => setL2HeaderBg(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={l2HeaderBg}
                              onChange={(e) => setL2HeaderBg(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Text</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={l2HeaderText}
                              onChange={(e) => setL2HeaderText(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={l2HeaderText}
                              onChange={(e) => setL2HeaderText(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Colors */}
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Sidebar</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={l2SidebarBg}
                              onChange={(e) => setL2SidebarBg(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={l2SidebarBg}
                              onChange={(e) => setL2SidebarBg(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Text</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={l2SidebarText}
                              onChange={(e) => setL2SidebarText(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={l2SidebarText}
                              onChange={(e) => setL2SidebarText(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Colors */}
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Main Content</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={l2MainBg}
                              onChange={(e) => setL2MainBg(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={l2MainBg}
                              onChange={(e) => setL2MainBg(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Text</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={l2MainText}
                              onChange={(e) => setL2MainText(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={l2MainText}
                              onChange={(e) => setL2MainText(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Colors */}
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Footer</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={l2FooterBg}
                              onChange={(e) => setL2FooterBg(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={l2FooterBg}
                              onChange={(e) => setL2FooterBg(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Text</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={l2FooterText}
                              onChange={(e) => setL2FooterText(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={l2FooterText}
                              onChange={(e) => setL2FooterText(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Border Color */}
                    <div className="border-l-4 border-pink-500 pl-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Borders</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Border Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={l2BorderColor}
                              onChange={(e) => setL2BorderColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={l2BorderColor}
                              onChange={(e) => setL2BorderColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copy Complete HTML Code
              </button>
            </div>

            {/* Live Preview Panel */}
            {showPreview && (
              <div className="lg:sticky lg:top-8 h-fit">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    Live Preview
                  </h3>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={selectedLayout === 'layout1' ? generateLayout1HTML({
                        headerBgColor, headerTextColor, headerText, sectionBgColor, sectionTitleColor, sectionTitle,
                        videoUrl, mainBgColor, mainTitleColor, mainTitle, mainBorderColor, introBgColor,
                        introTextColor, introText, cardBgColor, cardTextColor, point1Title, point1Desc,
                        point2Title, point2Desc
                      }) : generateLayout2HTML({
                        headerText, l2HeaderBg, l2HeaderText, l2SidebarBg, l2SidebarText, l2MainBg,
                        l2MainText, l2FooterBg, l2FooterText, l2BorderColor, mainTitle, introText,
                        point1Title, point1Desc, videoUrl, introBgColor
                      })}
                      className="w-full h-[600px] bg-white"
                      title="Live Preview"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedLayout && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Layout className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Choose a Layout to Get Started</h3>
            <p className="text-slate-600">Select a template above to begin customizing your page</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageDesign;