import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Upload, Video, Image as ImageIcon } from 'lucide-react';
import { uploadSign } from '../services/mongoApi';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface SignUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SignUploadForm: React.FC<SignUploadFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    language: '',
    difficulty_level: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [landmarkData, setLandmarkData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'basics', label: 'Basic Signs' },
    { value: 'alphabet', label: 'Alphabet' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'phrases', label: 'Phrases' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const languages = [
    { value: 'ASL', label: 'American Sign Language (ASL)' },
    { value: 'KSL', label: 'Kenyan Sign Language (KSL)' },
    { value: 'BSL', label: 'British Sign Language (BSL)' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileSelect = (type: 'video' | 'image', file: File | null) => {
    if (type === 'video') {
      setVideoFile(file);
    } else {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to upload signs');
      return;
    }

    if (!formData.name || !formData.category || !formData.language || !formData.difficulty_level) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!videoFile && !imageFile) {
      toast.error('Please upload at least one media file (video or image)');
      return;
    }

    setIsUploading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('language', formData.language);
      submitData.append('difficulty_level', formData.difficulty_level);
      submitData.append('user_id', user.id);
      submitData.append('tags', JSON.stringify(formData.tags));

      if (landmarkData) {
        submitData.append('landmark_data', JSON.stringify(landmarkData));
      }

      if (videoFile) {
        submitData.append('video', videoFile);
      }

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await uploadSign(submitData);
      toast.success('Sign uploaded successfully! It will be reviewed by administrators before being published.');
      onSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload sign. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload New Sign</CardTitle>
        <CardDescription>
          Contribute to the sign language community by uploading a new sign with video or image demonstration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Sign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Hello, Thank you, Apple"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe how to perform this sign, any variations, or context..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select value={formData.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(diff => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <Label>Media Files *</Label>

            {/* Video Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Video className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileSelect('video', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
                {videoFile && (
                  <div className="mt-2 text-sm text-green-600">
                    Selected: {videoFile.name}
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect('image', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
                {imageFile && (
                  <div className="mt-2 text-sm text-green-600">
                    Selected: {imageFile.name}
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Upload at least one media file. Videos should demonstrate the sign clearly, images can show hand positions.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isUploading} className="flex-1">
              {isUploading ? 'Uploading...' : 'Upload Sign'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};