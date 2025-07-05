import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Upload, Edit3, Check } from 'lucide-react';

// TypeScript Interfaces
interface TradingSetup {
  id: string;
  name: string;
  description: string;
  bulletPoints: string[];
  images: string[];
  lastModified: Date;
  color: string;
}

interface TradingRule {
  id: string;
  category: 'entry' | 'exit' | 'risk' | 'forbidden';
  content: string;
  lastModified: Date;
}

interface MentalState {
  confidence: 'low' | 'medium' | 'high';
  focus: 'low' | 'medium' | 'high';
  emotional: 'low' | 'medium' | 'high';
  energy: 'low' | 'medium' | 'high';
  lastModified: Date;
}

// Custom Hook for Trading Data
const useTradingData = () => {
  const [setups, setSetups] = useState<TradingSetup[]>([]);
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [mentalState, setMentalState] = useState<MentalState>({
    confidence: 'medium',
    focus: 'medium',
    emotional: 'medium',
    energy: 'medium',
    lastModified: new Date()
  });

  const defaultSetups: TradingSetup[] = [
    {
      id: '1',
      name: 'Breakout Setup',
      description: 'High momentum breakout above key resistance levels',
      bulletPoints: [
        'Volume spike confirmation',
        'Clean breakout above resistance',
        'Strong underlying trend'
      ],
      images: [],
      lastModified: new Date(),
      color: 'bg-pink-500'
    },
    {
      id: '2',
      name: 'Pullback Setup',
      description: 'Trend continuation after healthy pullback',
      bulletPoints: [
        'Pullback to key support level',
        'Bullish reversal pattern',
        'Strong trend context'
      ],
      images: [],
      lastModified: new Date(),
      color: 'bg-yellow-400'
    },
    {
      id: '3',
      name: 'Range Trading',
      description: 'Trading within established support/resistance range',
      bulletPoints: [
        'Clear range boundaries',
        'Multiple touches confirmed',
        'Low volatility environment'
      ],
      images: [],
      lastModified: new Date(),
      color: 'bg-lime-400'
    },
    {
      id: '4',
      name: 'Gap Fill',
      description: 'Trading gaps back to fair value',
      bulletPoints: [
        'Significant gap identified',
        'Volume confirmation',
        'Time-based opportunity'
      ],
      images: [],
      lastModified: new Date(),
      color: 'bg-blue-400'
    },
    {
      id: '5',
      name: 'News Reaction',
      description: 'Trading immediate market reaction to news events',
      bulletPoints: [
        'High-impact news event',
        'Clear directional bias',
        'Volume spike confirmation'
      ],
      images: [],
      lastModified: new Date(),
      color: 'bg-purple-500'
    }
  ];

  const defaultRules: TradingRule[] = [
    {
      id: '1',
      category: 'entry',
      content: 'Always wait for confirmation before entering position',
      lastModified: new Date()
    },
    {
      id: '2',
      category: 'exit',
      content: 'Take partial profits at first target',
      lastModified: new Date()
    },
    {
      id: '3',
      category: 'risk',
      content: 'Never risk more than 2% per trade',
      lastModified: new Date()
    },
    {
      id: '4',
      category: 'forbidden',
      content: 'No trading during lunch hour (11:30-1:30)',
      lastModified: new Date()
    }
  ];

  // Load data from localStorage
  useEffect(() => {
    const savedSetups = localStorage.getItem('tradingSetups');
    const savedRules = localStorage.getItem('tradingRules');
    const savedMentalState = localStorage.getItem('mentalState');

    if (savedSetups) {
      try {
        const parsed = JSON.parse(savedSetups);
        setSetups(parsed.map((setup: any) => ({
          ...setup,
          lastModified: new Date(setup.lastModified)
        })));
      } catch {
        setSetups(defaultSetups);
      }
    } else {
      setSetups(defaultSetups);
    }

    if (savedRules) {
      try {
        const parsed = JSON.parse(savedRules);
        setRules(parsed.map((rule: any) => ({
          ...rule,
          lastModified: new Date(rule.lastModified)
        })));
      } catch {
        setRules(defaultRules);
      }
    } else {
      setRules(defaultRules);
    }

    if (savedMentalState) {
      try {
        const parsed = JSON.parse(savedMentalState);
        setMentalState({
          ...parsed,
          lastModified: new Date(parsed.lastModified)
        });
      } catch {
        // Use default state
      }
    }
  }, []);

  // Save to localStorage
  const saveSetups = (newSetups: TradingSetup[]) => {
    setSetups(newSetups);
    localStorage.setItem('tradingSetups', JSON.stringify(newSetups));
  };

  const saveRules = (newRules: TradingRule[]) => {
    setRules(newRules);
    localStorage.setItem('tradingRules', JSON.stringify(newRules));
  };

  const saveMentalState = (newState: MentalState) => {
    setMentalState(newState);
    localStorage.setItem('mentalState', JSON.stringify(newState));
  };

  return {
    setups,
    rules,
    mentalState,
    updateSetup: (id: string, updates: Partial<TradingSetup>) => {
      const newSetups = setups.map(setup =>
        setup.id === id ? { ...setup, ...updates, lastModified: new Date() } : setup
      );
      saveSetups(newSetups);
    },
    updateRule: (id: string, content: string) => {
      const newRules = rules.map(rule =>
        rule.id === id ? { ...rule, content, lastModified: new Date() } : rule
      );
      saveRules(newRules);
    },
    updateMentalState: (updates: Partial<MentalState>) => {
      const newState = { ...mentalState, ...updates, lastModified: new Date() };
      saveMentalState(newState);
    }
  };
};

// Image Upload Component
const ImageUpload: React.FC<{
  onImageAdd: (base64: string) => void;
  className?: string;
}> = ({ onImageAdd, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const maxWidth = 1200;
            const maxHeight = 800;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            onImageAdd(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-4 border-black bg-white text-black font-black p-6 text-center cursor-pointer
          transition-all duration-75 hover:translate-x-1 hover:translate-y-1
          ${isDragging ? 'bg-pink-500 text-white' : 'hover:bg-cyan-400'}
        `}
      >
        <Upload className="mx-auto mb-2" size={24} />
        <div className="text-sm uppercase">
          {isDragging ? 'Drop images here' : 'ADD IMAGES (0)'}
        </div>
      </div>
    </div>
  );
};

// Image Gallery Component
const ImageGallery: React.FC<{
  images: string[];
  onImageDelete: (index: number) => void;
  onImageClick: (index: number) => void;
}> = ({ images, onImageDelete, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      <div className="relative border-4 border-black bg-black">
        <img
          src={images[currentIndex]}
          alt={`Setup image ${currentIndex + 1}`}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => onImageClick(currentIndex)}
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-1 hover:bg-yellow-400"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-1 hover:bg-yellow-400"
            >
              <ArrowRight size={16} />
            </button>
          </>
        )}
        
        <button
          onClick={() => onImageDelete(currentIndex)}
          className="absolute top-2 right-2 bg-red-500 text-white border-2 border-black p-1 hover:bg-red-600"
        >
          <X size={16} />
        </button>
        
        <div className="absolute bottom-2 right-2 bg-white border-2 border-black px-2 py-1 text-xs font-black">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className={`
                w-16 h-16 object-cover border-2 border-black cursor-pointer flex-shrink-0
                ${index === currentIndex ? 'border-4 border-pink-500' : ''}
              `}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Image Modal Component
const ImageModal: React.FC<{
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}> = ({ images, currentIndex, isOpen, onClose }) => {
  const [index, setIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setIndex(currentIndex);
    setZoom(1);
  }, [currentIndex, isOpen]);

  if (!isOpen || images.length === 0) return null;

  const nextImage = () => {
    setIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const prevImage = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full w-full h-full flex flex-col">
        <div className="flex items-center justify-between bg-white border-4 border-black p-4 mb-4">
          <div className="font-black text-black">
            IMAGE {index + 1} OF {images.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={zoomOut}
              className="bg-pink-500 text-white border-4 border-black p-2 hover:bg-pink-600 font-black"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={zoomIn}
              className="bg-cyan-400 text-black border-4 border-black p-2 hover:bg-cyan-500 font-black"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 text-white border-4 border-black p-2 hover:bg-red-600 font-black"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 relative border-4 border-black bg-black overflow-hidden">
          <img
            src={images[index]}
            alt={`Full size ${index + 1}`}
            className="w-full h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom})`
            }}
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-2 hover:bg-yellow-400"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-2 hover:bg-yellow-400"
              >
                <ArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Setup Card Component
const SetupCard: React.FC<{
  setup: TradingSetup;
  onUpdate: (updates: Partial<TradingSetup>) => void;
}> = ({ setup, onUpdate }) => {
  const [isEditing, setIsEditing] = useState({ name: false, description: false, points: -1 });
  const [editValues, setEditValues] = useState({ name: setup.name, description: setup.description, point: '' });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageAdd = (base64: string) => {
    onUpdate({ images: [...setup.images, base64] });
  };

  const handleImageDelete = (index: number) => {
    const newImages = setup.images.filter((_, i) => i !== index);
    onUpdate({ images: newImages });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const handleEditSave = (field: 'name' | 'description') => {
    onUpdate({ [field]: editValues[field] });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handlePointEdit = (index: number) => {
    setEditValues({ ...editValues, point: setup.bulletPoints[index] });
    setIsEditing({ ...isEditing, points: index });
  };

  const handlePointSave = () => {
    const newPoints = [...setup.bulletPoints];
    newPoints[isEditing.points] = editValues.point;
    onUpdate({ bulletPoints: newPoints });
    setIsEditing({ ...isEditing, points: -1 });
  };

  const addBulletPoint = () => {
    onUpdate({ bulletPoints: [...setup.bulletPoints, 'New point'] });
  };

  const deleteBulletPoint = (index: number) => {
    const newPoints = setup.bulletPoints.filter((_, i) => i !== index);
    onUpdate({ bulletPoints: newPoints });
  };

  return (
    <>
      <div className={`${setup.color} border-4 border-black p-6 space-y-4 transition-all duration-75 hover:translate-x-1 hover:translate-y-1`}>
        <div>
          {isEditing.name ? (
            <div className="flex gap-2">
              <input
                value={editValues.name}
                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                className="flex-1 border-2 border-black p-2 font-black text-black bg-white"
                autoFocus
              />
              <button
                onClick={() => handleEditSave('name')}
                className="bg-lime-400 text-black border-4 border-black p-2 hover:bg-lime-500 font-black"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setIsEditing({ ...isEditing, name: false })}
                className="bg-red-500 text-white border-4 border-black p-2 hover:bg-red-600 font-black"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <h3
              onClick={() => {
                setEditValues({ ...editValues, name: setup.name });
                setIsEditing({ ...isEditing, name: true });
              }}
              className="text-2xl font-black text-black uppercase cursor-pointer hover:underline flex items-center gap-2"
            >
              {setup.name}
              <Edit3 size={16} />
            </h3>
          )}
        </div>

        <div>
          {isEditing.description ? (
            <div className="space-y-2">
              <textarea
                value={editValues.description}
                onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                className="w-full border-2 border-black p-2 font-bold text-black bg-white resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSave('description')}
                  className="bg-lime-400 text-black border-4 border-black px-3 py-1 font-black text-xs hover:bg-lime-500"
                >
                  SAVE
                </button>
                <button
                  onClick={() => setIsEditing({ ...isEditing, description: false })}
                  className="bg-red-500 text-white border-4 border-black px-3 py-1 font-black text-xs hover:bg-red-600"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => {
                setEditValues({ ...editValues, description: setup.description });
                setIsEditing({ ...isEditing, description: true });
              }}
              className="text-black font-bold cursor-pointer hover:underline"
            >
              {setup.description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {setup.bulletPoints.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-black border border-black"></div>
              {isEditing.points === index ? (
                <div className="flex-1 flex gap-2">
                  <input
                    value={editValues.point}
                    onChange={(e) => setEditValues({ ...editValues, point: e.target.value })}
                    className="flex-1 border-2 border-black p-1 font-bold text-black bg-white text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handlePointSave}
                    className="bg-lime-400 text-black border-4 border-black p-1 hover:bg-lime-500 font-black"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => setIsEditing({ ...isEditing, points: -1 })}
                    className="bg-red-500 text-white border-4 border-black p-1 hover:bg-red-600 font-black"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span
                    onClick={() => handlePointEdit(index)}
                    className="font-bold text-black cursor-pointer hover:underline text-sm"
                  >
                    {point}
                  </span>
                  <button
                    onClick={() => deleteBulletPoint(index)}
                    className="bg-red-500 text-white border-2 border-black p-1 hover:bg-red-600 opacity-75 hover:opacity-100 font-black"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
          ))}
          
          <button
            onClick={addBulletPoint}
            className="flex items-center gap-2 text-black font-black text-sm hover:underline"
          >
            <Plus size={12} />
            ADD POINT
          </button>
        </div>

        <div className="space-y-4">
          {setup.images.length > 0 && (
            <ImageGallery
              images={setup.images}
              onImageDelete={handleImageDelete}
              onImageClick={handleImageClick}
            />
          )}
          
          <ImageUpload onImageAdd={handleImageAdd} />
        </div>

        <div className="text-xs font-black text-black">
          LAST UPDATED: {setup.lastModified.toLocaleDateString('en-GB')}
        </div>
      </div>

      <ImageModal
        images={setup.images}
        currentIndex={selectedImageIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

// Rules Panel Component
const RulesPanel: React.FC<{
  rules: TradingRule[];
  onUpdate: (id: string, content: string) => void;
}> = ({ rules, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleEdit = (rule: TradingRule) => {
    setEditingId(rule.id);
    setEditContent(rule.content);
  };

  const handleSave = () => {
    if (editingId) {
      onUpdate(editingId, editContent);
      setEditingId(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'entry': return 'bg-cyan-400';
      case 'exit': return 'bg-lime-400';
      case 'risk': return 'bg-yellow-400';
      case 'forbidden': return 'bg-pink-500';
      default: return 'bg-white';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'entry': return 'ENTRY RULES';
      case 'exit': return 'EXIT RULES';
      case 'risk': return 'RISK MANAGEMENT';
      case 'forbidden': return 'FORBIDDEN ACTIONS';
      default: return category.toUpperCase();
    }
  };

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, TradingRule[]>);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-black uppercase">TRADING RULES</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(groupedRules).map(([category, categoryRules]) => (
          <div key={category} className={`${getCategoryColor(category)} border-4 border-black p-4`}>
            <h3 className="font-black text-black text-lg mb-3 uppercase">
              {getCategoryTitle(category)}
            </h3>
            
            {categoryRules.map((rule) => (
              <div key={rule.id} className="mb-3">
                {editingId === rule.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full border-2 border-black p-2 font-bold text-black bg-white resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="bg-lime-400 text-black border-4 border-black px-3 py-1 font-black text-xs hover:bg-lime-500"
                      >
                        SAVE
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-red-500 text-white border-4 border-black px-3 py-1 font-black text-xs hover:bg-red-600"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => handleEdit(rule)}
                    className="font-bold text-black cursor-pointer hover:underline"
                  >
                    {rule.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Mental State Check Component
const MentalCheck: React.FC<{
  mentalState: MentalState;
  onUpdate: (updates: Partial<MentalState>) => void;
}> = ({ mentalState, onUpdate }) => {
  const metrics = [
    { key: 'confidence' as keyof MentalState, label: 'Confidence', icon: '🎯' },
    { key: 'focus' as keyof MentalState, label: 'Focus', icon: '🔍' },
    { key: 'emotional' as keyof MentalState, label: 'Emotional', icon: '❤️' },
    { key: 'energy' as keyof MentalState, label: 'Energy', icon: '⚡' }
  ];

  const getStateColor = (state: string) => {
    switch (state) {
      case 'low': return 'bg-red-500';
      case 'medium': return 'bg-orange-400';
      case 'high': return 'bg-lime-400';
      default: return 'bg-white';
    }
  };

  const cycleState = (currentState: string) => {
    switch (currentState) {
      case 'low': return 'medium';
      case 'medium': return 'high';
      case 'high': return 'low';
      default: return 'medium';
    }
  };

  const handleStateChange = (key: keyof MentalState) => {
    const currentValue = mentalState[key] as string;
    const newValue = cycleState(currentValue);
    onUpdate({ [key]: newValue });
  };

  const calculateScore = () => {
    const values = [mentalState.confidence, mentalState.focus, mentalState.emotional, mentalState.energy];
    const total = values.reduce((sum, val) => {
      switch (val) {
        case 'low': return sum + 1;
        case 'medium': return sum + 2;
        case 'high': return sum + 3;
        default: return sum;
      }
    }, 0);
    return Math.round((total / 12) * 100);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-black uppercase">MENTAL STATE CHECK</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.key} className="space-y-2">
            <div className="text-center">
              <div className="text-2xl mb-1">{metric.icon}</div>
              <div className="font-black text-black text-sm uppercase">{metric.label}</div>
            </div>
            
            <button
              onClick={() => handleStateChange(metric.key)}
              className={`
                w-full ${getStateColor(mentalState[metric.key] as string)} 
                border-4 border-black p-3 font-black text-black uppercase text-sm
                transition-all duration-75 hover:translate-x-1 hover:translate-y-1
              `}
            >
              {String(mentalState[metric.key])}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border-4 border-black p-4 text-center">
        <div className="text-4xl font-black text-black">{calculateScore()}%</div>
        <div className="font-bold text-black">OVERALL SCORE</div>
        <div className="text-xs font-black text-black mt-2">
          LAST CHECK: {mentalState.lastModified.toLocaleString('en-GB')}
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header: React.FC = () => {
  const now = new Date();
  const isMarketOpen = now.getHours() >= 9 && now.getHours() < 17 && now.getDay() >= 1 && now.getDay() <= 5;

  return (
    <header className="bg-cyan-400 border-b-4 border-black p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-black text-cyan-400 font-black p-3 text-2xl border-4 border-black">FT</div>
          <h1 className="text-3xl font-black text-black uppercase">
            FUTURES TRADING DASHBOARD
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 border-4 border-black ${isMarketOpen ? 'bg-lime-400' : 'bg-red-500'}`}></div>
            <span className="font-black text-black text-sm uppercase">
              MARKET {isMarketOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          
          <div className="bg-yellow-400 border-4 border-black px-3 py-1 font-black text-black text-sm">
            {now.toLocaleDateString('en-GB')}
          </div>
        </div>
      </div>
    </header>
  );
};

// Main Application
const App: React.FC = () => {
  const { setups, rules, mentalState, updateSetup, updateRule, updateMentalState } = useTradingData();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto p-6 space-y-8">
        {/* Trading Setups Section */}
        <section>
          <h2 className="text-4xl font-black text-black uppercase mb-6 text-center">
            TRADING SETUPS
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {setups.map((setup) => (
              <SetupCard
                key={setup.id}
                setup={setup}
                onUpdate={(updates) => updateSetup(setup.id, updates)}
              />
            ))}
          </div>
        </section>

        {/* Rules Panel */}
        <section>
          <RulesPanel rules={rules} onUpdate={updateRule} />
        </section>

        {/* Mental State Check */}
        <section>
          <MentalCheck mentalState={mentalState} onUpdate={updateMentalState} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-purple-600 text-white p-4 text-center border-t-4 border-black">
        <div className="font-black text-sm uppercase">
          Trading Dashboard v3.0 • Built for Professional Traders
        </div>
      </footer>
    </div>
  );
};

export default App;
