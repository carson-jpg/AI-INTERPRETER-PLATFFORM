import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { CheckCircle, XCircle, Eye, Clock, User, Calendar } from 'lucide-react';
import { getPendingSigns, moderateSign } from '../services/mongoApi';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { ISign } from '../lib/mongo';

export const SignModerationPanel: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [pendingSigns, setPendingSigns] = useState<ISign[]>([]);
  const [selectedSign, setSelectedSign] = useState<ISign | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModerating, setIsModerating] = useState(false);

  useEffect(() => {
    loadPendingSigns();
  }, []);

  const loadPendingSigns = async () => {
    setIsLoading(true);
    try {
      const signs = await getPendingSigns();
      setPendingSigns(signs);
    } catch (error) {
      console.error('Failed to load pending signs:', error);
      toast.error('Failed to load pending signs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (action: 'approve' | 'reject') => {
    if (!selectedSign || !user) return;

    setIsModerating(true);
    try {
      await moderateSign(selectedSign.id, action, reviewNotes, user.id);

      // Update local state
      setPendingSigns(prev => prev.filter(sign => sign.id !== selectedSign.id));
      setSelectedSign(null);
      setReviewNotes('');

      toast.success(`Sign ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Moderation failed:', error);
      toast.error('Failed to moderate sign');
    } finally {
      setIsModerating(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sign Moderation</h2>
          <p className="text-gray-600">Review and approve community-contributed signs</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {pendingSigns.length} pending
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Signs List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pending Signs</h3>
          {pendingSigns.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                No pending signs to review
              </CardContent>
            </Card>
          ) : (
            pendingSigns.map(sign => (
              <Card
                key={sign.id}
                className={`cursor-pointer transition-colors ${
                  selectedSign?.id === sign.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedSign(sign)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{sign.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{sign.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {sign.contributor_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(sign.created_at!)}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{sign.language}</Badge>
                        <Badge variant="outline">{sign.category}</Badge>
                        <Badge variant="outline">{sign.difficulty_level}</Badge>
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sign Review Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review Sign</h3>
          {selectedSign ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {selectedSign.name}
                </CardTitle>
                <CardDescription>
                  Submitted by {selectedSign.contributor_name} on {formatDate(selectedSign.created_at!)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Media Preview */}
                <div className="space-y-2">
                  {selectedSign.video_url && (
                    <div>
                      <Label>Video</Label>
                      <video
                        src={selectedSign.video_url}
                        controls
                        className="w-full max-h-48 rounded-lg"
                      />
                    </div>
                  )}
                  {selectedSign.image_url && (
                    <div>
                      <Label>Image</Label>
                      <img
                        src={selectedSign.image_url}
                        alt={selectedSign.name}
                        className="w-full max-h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Sign Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Language</Label>
                    <p className="font-medium">{selectedSign.language}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="font-medium">{selectedSign.category}</p>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <p className="font-medium">{selectedSign.difficulty_level}</p>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <p className="font-medium">{selectedSign.description || 'No description'}</p>
                  </div>
                </div>

                {/* Tags */}
                {selectedSign.tags && selectedSign.tags.length > 0 && (
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedSign.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                <div className="space-y-2">
                  <Label htmlFor="review-notes">Review Notes (Optional)</Label>
                  <Textarea
                    id="review-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes for the contributor..."
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleModerate('approve')}
                    disabled={isModerating}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isModerating ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleModerate('reject')}
                    disabled={isModerating}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isModerating ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Eye className="mx-auto h-12 w-12 mb-4" />
                Select a sign from the list to review
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};