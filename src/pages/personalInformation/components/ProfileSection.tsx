import { useState, useEffect } from 'react';

import { Upload, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import QuestionIndicator from './QuestionIndicator';
import { ImageUploader } from '@/pages/profile/components/userImage-uploader';
import { useDispatch, useSelector } from 'react-redux';
import {ProfileFormData} from "../index"

import axiosInstance from '@/lib/axios';
import { AppDispatch } from '@/redux/store';
import { fetchUsers } from '@/redux/features/userSlice';



export default function ProfileSection({
  formData,
  setFormData,
  isImageUploaderOpen,
  setIsImageUploaderOpen,
  onComplete,
  isComplete,
  currentQuestion,
  setCurrentQuestion,
}) {
  const [profileData, setProfileData] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<AppDispatch>();


  const fetchProfileData = async () => {
    try {
    const response = await dispatch(fetchUsers(user?._id));
    
    
      if (fetchUsers.fulfilled.match(response)) {
        const data = response.payload;
        setProfileData(data);
      } else {
        console.error('Error fetching users:', response.payload);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    };
    
    useEffect(() => {
    fetchProfileData();
    const interval = setInterval(() => {
    fetchProfileData();
    }, 10000);
    
    
    return () => clearInterval(interval);
    }, [user?._id, dispatch]);


    const handleUploadComplete = (data: any) => {
    setIsImageUploaderOpen(false);
    fetchProfileData();
    };

  const questions = [
    {
      id: 'profileImage',
      title: 'Let\'s start with your profile picture',
      description: 'A professional photo helps others recognize you',
      component: (
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg">
            <img
              src={profileData?.image || "https://kzmjkvje8tr2ra724fhh.lite.vusercontent.net/placeholder.svg"}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          </div>
          <Button 
            onClick={() => setIsImageUploaderOpen(true)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Upload Photo
          </Button>
          <p className="text-sm text-gray-500">This step is optional but recommended</p>
        </div>
      ),
      isComplete: true // Always true since it's optional
    },
    {
      id: 'jobTitle',
      title: 'What is your job title?',
      description: 'Let others know what you do professionally',
      component: (
        <div className="space-y-3 py-4">
          <Label htmlFor="jobTitle" className="text-base font-medium">Job Title / Position</Label>
          <Input
            id="jobTitle"
            type="text"
            value={formData.profile.jobTitle}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  jobTitle: e.target.value
                }
              }));
            }}
            placeholder="e.g. Senior Developer, Marketing Manager"
            className="w-full text-lg"
          />
        </div>
      ),
      isComplete: formData.profile.jobTitle.trim() !== ''
    },
    {
      id: 'bio',
      title: 'Tell us a bit about yourself',
      description: 'Share your background, expertise, or interests',
      component: (
        <div className="space-y-3 py-4">
          <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
          <Textarea
            id="bio"
            value={formData.profile.bio}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  bio: e.target.value
                }
              }));
            }}
            placeholder="I am a software developer with 5 years of experience..."
            rows={5}
            className="text-base"
          />
        </div>
      ),
      isComplete: formData.profile.bio.trim() !== ''
    },
    {
      id: 'socialLinks',
      title: 'Any social profiles you want to share?',
      description: 'Connect with others through your social media',
      component: (
        <div className="space-y-4 py-4">
          <Label className="text-base font-medium">Social Links (optional)</Label>
          <div className="space-y-3">
            {formData.profile.socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...formData.profile.socialLinks];
                    newLinks[index] = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        socialLinks: newLinks
                      }
                    }));
                  }}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    const newLinks = [...formData.profile.socialLinks];
                    newLinks.splice(index, 1);
                    setFormData(prev => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        socialLinks: newLinks
                      }
                    }));
                  }}
                  className="h-10 w-10"
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    socialLinks: [...prev.profile.socialLinks, '']
                  }
                }));
              }}
              size="sm"
              className="mt-2 flex items-center gap-1"
            >
              <Plus size={16} />
              Add Social Link
            </Button>
          </div>
          <p className="text-sm text-gray-500">This step is completely optional</p>
        </div>
      ),
      isComplete: true // Always true since it's optional
    }
  ];

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  
  const isCurrentQuestionComplete = questions[currentQuestion]?.isComplete || false;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <>
      <Card className="overflow-hidden bg-white shadow-md transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <div 
              className={`transform transition-all duration-300 ${animating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}
            >
              <div className="px-6 pt-6">
                
                
                <h2 className="mt-4 text-xl font-semibold text-gray-800">
                  {questions[currentQuestion]?.title}
                </h2>
                <p className="text-gray-600">
                  {questions[currentQuestion]?.description}
                </p>
              </div>
              
              <div className="p-6">
                {questions[currentQuestion]?.component}
              </div>
            </div>
          </div>

          <div className="flex justify-between bg-gray-50 p-4">
            <Button
              variant="ghost"
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
              className={currentQuestion === 0 ? 'invisible' : 'bg-taskplanner text-white hover:bg-taskplanner/90'}

            >
              Back
            </Button>
            
            {isLastQuestion ? (
              <Button 
                onClick={onComplete}
                disabled={!isComplete}
                className="bg-taskplanner text-white hover:bg-taskplanner/90"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={goToNextQuestion}
                disabled={!isCurrentQuestionComplete}
                className="bg-taskplanner text-white hover:bg-taskplanner/90"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isImageUploaderOpen && (
        <ImageUploader
          open={isImageUploaderOpen}
          onOpenChange={setIsImageUploaderOpen}
          onUploadComplete={handleUploadComplete}
          entityId={user._id}

        />
      )}
    </>
  );
}