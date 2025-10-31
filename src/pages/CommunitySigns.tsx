import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Search, Filter, User, Calendar, Eye, Play } from 'lucide-react';
import { SignUploadForm } from '../components/SignUploadForm';
import { SignModerationPanel } from '../components/SignModerationPanel';
import { getSigns, getUserContributedSigns, checkAdminStatus } from '../services/mongoApi';
import { useAuth } from '../hooks/useAuth';
import { ISign } from '../lib/mongo';
import { toast } from 'sonner';

export const CommunitySigns: React.FC = () => {
  const { user } = useAuth();
  const [signs, setSigns] = useState<ISign[]>([]);
  const [userSigns, setUserSigns] = useState<ISign[]>([]);
  const [filteredSigns, setFilteredSigns] = useState<ISign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [contributedFilter, setContributedFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedSign, setSelectedSign] = useState<ISign | null>(null);

  useEffect(() => {
    loadSigns();
    if (user) {
      loadUserSigns();
      checkAdmin();
    }
  }, [user]);

  useEffect(() => {
    filterSigns();
  }, [signs, searchTerm, languageFilter, categoryFilter, difficultyFilter, contributedFilter]);

  const loadSigns = async () => {
    try {
      const filters: any = {};
      if (languageFilter !== 'all') filters.language = languageFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (difficultyFilter !== 'all') filters.difficulty = difficultyFilter;
      if (contributedFilter !== 'all') filters.contributed = contributedFilter;

      const allSigns = await getSigns(filters);
      setSigns(allSigns);
    } catch (error) {
      console.error('Failed to load signs:', error);
      toast.error('Failed to load signs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserSigns = async () => {
    if (!user) return;
    try {
      const userContributedSigns = await getUserContributedSigns(user.id);
      setUserSigns(userContributedSigns);
    } catch (error) {
      console.error('Failed to load user signs:', error);
    }
  };

  const checkAdmin = async () => {
    if (!user) return;
    try {
      const adminStatus = await checkAdminStatus(user.id);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  };

  const filterSigns = () => {
    let filtered = signs;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(sign =>
        sign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sign.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSigns(filtered);
  };

  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    loadSigns();
    if (user) loadUserSigns();
    toast.success('Sign uploaded successfully! It will be reviewed before being published.');
  };

  const handleSignClick = (sign: ISign) => {
    setSelectedSign(sign);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (sign: ISign) => {
    if (!sign.contributed_by) return null;

    switch (sign.status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Community Signs</h1>
          <p className="text-gray-600 mt-2">
            Explore signs contributed by the community and share your own knowledge
          </p>
        </div>
        {user && (
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Sign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Sign</DialogTitle>
              </DialogHeader>
              <SignUploadForm
                onSuccess={handleUploadSuccess}
                onCancel={() => setShowUploadDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Signs</TabsTrigger>
          {user && <TabsTrigger value="my-signs">My Contributions</TabsTrigger>}
          {isAdmin && <TabsTrigger value="moderate">Moderate</TabsTrigger>}
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Input
                    placeholder="Search signs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="ASL">ASL</SelectItem>
                    <SelectItem value="KSL">KSL</SelectItem>
                    <SelectItem value="BSL">BSL</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="basics">Basics</SelectItem>
                    <SelectItem value="alphabet">Alphabet</SelectItem>
                    <SelectItem value="numbers">Numbers</SelectItem>
                    <SelectItem value="phrases">Phrases</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={contributedFilter} onValueChange={setContributedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Signs</SelectItem>
                    <SelectItem value="false">Official</SelectItem>
                    <SelectItem value="true">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSigns.map(sign => (
              <Card key={sign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{sign.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {sign.description || 'No description available'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(sign)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Media Preview */}
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {sign.video_url ? (
                      <video
                        src={sign.video_url}
                        className="w-full h-full object-cover"
                        onClick={() => setSelectedSign(sign)}
                        style={{ cursor: 'pointer' }}
                      />
                    ) : sign.image_url ? (
                      <img
                        src={sign.image_url}
                        alt={sign.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleSignClick(sign)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Eye className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Sign Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex gap-2">
                      <Badge variant="outline">{sign.language}</Badge>
                      <Badge variant="outline">{sign.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{sign.difficulty_level}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSignClick(sign)}
                        className="p-1 h-6 w-6"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  {sign.tags && sign.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sign.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {sign.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{sign.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Contributor Info */}
                  {sign.contributed_by && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>By {sign.contributor_name}</span>
                      <Calendar className="h-4 w-4 ml-2" />
                      <span>{formatDate(sign.created_at!)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSigns.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No signs found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or be the first to contribute a sign!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="my-signs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSigns.map(sign => (
                <Card key={sign.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{sign.name}</CardTitle>
                      {getStatusBadge(sign)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {sign.video_url ? (
                        <video
                          src={sign.video_url}
                          className="w-full h-full object-cover"
                        />
                      ) : sign.image_url ? (
                        <img
                          src={sign.image_url}
                          alt={sign.name}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handleSignClick(sign)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>Status: {sign.status || 'pending'}</p>
                      {sign.review_notes && (
                        <p className="mt-1">Review: {sign.review_notes}</p>
                      )}
                      <p className="mt-1">Submitted: {formatDate(sign.created_at!)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {userSigns.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contributions yet</h3>
                  <p className="text-gray-500 mb-4">
                    Share your knowledge by uploading signs to the community!
                  </p>
                  <Button onClick={() => setShowUploadDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Your First Sign
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="moderate">
            <SignModerationPanel />
          </TabsContent>
        )}
      </Tabs>

      {/* Sign Detail Modal */}
      {selectedSign && (
        <Dialog open={!!selectedSign} onOpenChange={() => setSelectedSign(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedSign.name}
                {getStatusBadge(selectedSign)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Media Display */}
              <div className="relative">
                {selectedSign.video_url ? (
                  <video
                    src={selectedSign.video_url}
                    controls
                    className="w-full rounded-lg max-h-96 object-contain"
                    poster={selectedSign.image_url}
                  />
                ) : selectedSign.image_url ? (
                  <img
                    src={selectedSign.image_url}
                    alt={selectedSign.name}
                    className="w-full rounded-lg max-h-96 object-contain"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Sign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Sign Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language:</span>
                        <Badge variant="outline">{selectedSign.language}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <Badge variant="outline">{selectedSign.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <Badge variant="outline">{selectedSign.difficulty_level}</Badge>
                      </div>
                    </div>
                  </div>

                  {selectedSign.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedSign.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedSign.tags && selectedSign.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSign.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSign.contributed_by && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contribution Info</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Contributed by {selectedSign.contributor_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Submitted {formatDate(selectedSign.created_at!)}</span>
                        </div>
                        {selectedSign.review_notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <strong>Review Notes:</strong> {selectedSign.review_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};