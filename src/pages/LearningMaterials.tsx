import { useState, useEffect } from 'react';
import { BookOpen, Play, Download, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLearningMaterials } from '../services/mongoApi';
import { useToast } from '../hooks/use-toast';

interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'document' | 'interactive';
  category: 'basics' | 'alphabet' | 'numbers' | 'phrases' | 'advanced';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  thumbnail_url?: string;
}

const LearningMaterials = () => {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = ['all', 'basics', 'alphabet', 'numbers', 'phrases', 'advanced'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    loadMaterials();
  }, [selectedCategory, selectedDifficulty]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const filters = {
        category: selectedCategory,
        difficulty: selectedDifficulty
      };
      
      const data = await getLearningMaterials(filters);
      const formattedMaterials = data.map((material: any) => ({
        id: material.id.toString(),
        title: material.title,
        description: material.description,
        content_type: material.content_type,
        category: material.category,
        difficulty_level: material.difficulty_level,
        duration: material.duration,
        thumbnail_url: material.thumbnail_url
      }));
      
      setMaterials(formattedMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast({
        title: "Error",
        description: "Failed to load learning materials",
        variant: "destructive",
      });
      // Fallback to empty array
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-5 w-5" />;
      case 'document': return <BookOpen className="h-5 w-5" />;
      case 'interactive': return <Filter className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-600';
      case 'document': return 'bg-blue-100 text-blue-600';
      case 'interactive': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartLearning = (material: LearningMaterial) => {
    // Navigate to lesson page with material ID
    navigate(`/lesson/${material.id}`);
  };

  const handleDownload = (material: LearningMaterial) => {
    // For now, show a toast message. In a real app, this would download the material
    toast({
      title: "Download Started",
      description: `Downloading ${material.title}...`,
    });

    // Simulate download (in a real app, this would trigger actual download)
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${material.title} has been downloaded successfully.`,
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Learning Materials</h1>
                <p className="text-sm text-gray-600">Comprehensive resources for sign language learning</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div key={material.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(material.content_type)}`}>
                      {getTypeIcon(material.content_type)}
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty_level)}`}>
                        {material.difficulty_level}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {material.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{material.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{material.description}</p>

                  {material.duration && (
                    <p className="text-sm text-gray-500 mb-4">Duration: {material.duration} min</p>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStartLearning(material)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all text-sm font-medium"
                    >
                      Start Learning
                    </button>
                    <button
                      onClick={() => handleDownload(material)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMaterials.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria, or add some materials to your database.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default LearningMaterials;
