// pages/personalInformation.tsx
import { useState } from 'react';
import { User, Briefcase, Info, LogOut } from 'lucide-react';
import ProfileSection from './components/ProfileSection';
import CompanySection from './components/CompanySection';
import AdditionalInfoSection from './components/AdditionalInfoSection';
import ProgressTracker from './components/ProgressTracker';
import { toast } from '@/components/ui/use-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { useNavigate } from 'react-router-dom';
import { logout, personalInformation } from '@/redux/features/authSlice';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { Button } from '@/components/ui/button';

export type ProfileFormData = {
  profile: {
    jobTitle: string;
    bio: string;
    socialLinks: string[];
  };
  company: {
    isEmployed: boolean;
    companyType: string;
    companyName: string;
    companyAddress: string;
    companyWebsite: string;
    companyPhone: string;
    companyEmail: string;
  };
  additionalInfo: {
    howDidYouHear: string;
    industryType: string;
    numberOfEmployees: string;
  };
};

export type SectionStatus = 'inactive' | 'active' | 'completed';

export default function PersonalInformationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [profileQuestion, setProfileQuestion] = useState(0);
  const [companyQuestion, setCompanyQuestion] = useState(0);
  const [additionalQuestion, setAdditionalQuestion] = useState(0);
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<ProfileFormData>({
    profile: {
      jobTitle: '',
      bio: '',
      socialLinks: []
    },
    company: {
      isEmployed: false,
      companyType: '',
      companyName: '',
      companyAddress: '',
      companyWebsite: '',
      companyPhone: '',
      companyEmail: ''
    },
    additionalInfo: {
      howDidYouHear: '',
      industryType: '',
      numberOfEmployees: ''
    }
  });

  const [currentSection, setCurrentSection] = useState<
    'profile' | 'company' | 'additional'
  >('profile');

  const { clearSavedState } = useFormPersistence({
    formData,
    setFormData,
    currentSection,
    setCurrentSection,
    profileQuestion,
    setProfileQuestion,
    companyQuestion,
    setCompanyQuestion,
    additionalQuestion,
    setAdditionalQuestion
  });

  const isProfileComplete =
    formData.profile.jobTitle.trim() !== '' &&
    formData.profile.bio.trim() !== '';
  const isCompanyComplete = formData.company.isEmployed
  ? formData.company.companyType.trim() !== '' &&
    formData.company.companyName.trim() !== '' &&
    formData.company.companyAddress.trim() !== '' &&
    formData.company.companyWebsite.trim() !== '' &&
    formData.company.companyEmail.trim() !== '' &&
    formData.company.companyPhone.trim() !== ''
  : true;


  const isAdditionalInfoComplete =
    formData.additionalInfo.howDidYouHear.trim() !== '' &&
    formData.additionalInfo.industryType.trim() !== '' &&
    formData.additionalInfo.numberOfEmployees.trim() !== '';

  const getProfileStatus = (): SectionStatus => {
    if (currentSection === 'profile') return 'active';
    return isProfileComplete ? 'completed' : 'inactive';
  };

  const getCompanyStatus = (): SectionStatus => {
    if (!isProfileComplete) return 'inactive';
    if (currentSection === 'company') return 'active';
    return isCompanyComplete ? 'completed' : 'inactive';
  };

  const getAdditionalStatus = (): SectionStatus => {
    if (!isProfileComplete || !isCompanyComplete) return 'inactive';
    if (currentSection === 'additional') return 'active';
    return isAdditionalInfoComplete ? 'completed' : 'inactive';
  };

const handleUpdateSection = (section: 'profile' | 'company' | 'additional') => {
  setCurrentSection(section);

  const savedQuestionIndex = localStorage.getItem(`question_index_${section}`);
  if (savedQuestionIndex) {
    if (section === 'profile') setProfileQuestion(parseInt(savedQuestionIndex, 10));
    if (section === 'company') setCompanyQuestion(parseInt(savedQuestionIndex, 10));
    if (section === 'additional') setAdditionalQuestion(parseInt(savedQuestionIndex, 10));
  } else {
    if (section === 'profile') setProfileQuestion(0);
    if (section === 'company') setCompanyQuestion(0);
    if (section === 'additional') setAdditionalQuestion(0);
  }
};


  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const personalData: Record<string, any> = {};

      if (formData.profile.jobTitle)
        personalData.jobTitle = formData.profile.jobTitle;
      if (formData.profile.bio) personalData.bio = formData.profile.bio;
      if (formData.profile.socialLinks?.length)
        personalData.socialLinks = formData.profile.socialLinks;

      if (formData.company.companyType)
        personalData.companyType = formData.company.companyType;
      if (formData.company.companyWebsite)
        personalData.companyWebsite = formData.company.companyWebsite;
      if (formData.company.companyAddress)
        personalData.address = formData.company.companyAddress;
      if (formData.company.companyPhone)
        personalData.phone = formData.company.companyPhone;
      if (formData.company.companyEmail)
        personalData.companyEmail = formData.company.companyEmail;

      if (formData.additionalInfo.industryType)
        personalData.industryType = formData.additionalInfo.industryType;
      if (formData.additionalInfo.numberOfEmployees)
        personalData.numberOfEmployees =
          formData.additionalInfo.numberOfEmployees;
      if (formData.additionalInfo.howDidYouHear)
        personalData.heardAboutUs = formData.additionalInfo.howDidYouHear;

      personalData.authorized = true;

      const resultAction = await dispatch(
        personalInformation({ userId: user?._id, profileData: personalData })
      );

      if (personalInformation.fulfilled.match(resultAction)) {
        toast({ title: 'Profile completed successfully!' });
        clearSavedState(); // Clear localStorage after successful submission
        navigate('/dashboard');
      } else {
        throw new Error(
          resultAction.error?.message || 'Failed to update profile'
        );
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile information. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      status: getProfileStatus(),
      component: (
        <ProfileSection
          formData={formData}
          setFormData={setFormData}
          isImageUploaderOpen={isImageUploaderOpen}
          setIsImageUploaderOpen={setIsImageUploaderOpen}
          onComplete={() => handleUpdateSection('company')}
          isComplete={isProfileComplete}
          currentQuestion={profileQuestion}
          setCurrentQuestion={setProfileQuestion}
        />
      )
    },
    {
      id: 'company',
      title: 'Company',
      icon: Briefcase,
      status: getCompanyStatus(),
      component: (
  <CompanySection
    formData={formData}
    setFormData={setFormData}
    onBack={() => handleUpdateSection('profile')}
    onComplete={() => handleUpdateSection('additional')}
    isComplete={isCompanyComplete}
    currentQuestion={companyQuestion} // ✅ must pass current question
    setCurrentQuestion={setCompanyQuestion} // ✅ setter
  />
)

    },
    {
  id: 'additional',
  title: 'Additional Info',
  icon: Info,
  status: getAdditionalStatus(),
  component: (
    <AdditionalInfoSection
      formData={formData}
      setFormData={setFormData}
      onBack={() => handleUpdateSection('company')}
      onComplete={handleSubmit}
      isSubmitting={isSubmitting}
      isComplete={isAdditionalInfoComplete}
      currentQuestion={additionalQuestion} // ✅ fix here
      setCurrentQuestion={setAdditionalQuestion} // ✅ fix here
    />
  )
}

  ];

  const completedSections = [
    isProfileComplete,
    isCompanyComplete,
    isAdditionalInfoComplete
  ].filter(Boolean).length;
  const progressPercentage = (completedSections / 3) * 100;


   const handleLogout = async () => {
      await dispatch(logout());
      navigate('/'); // Redirect to login after logout
    };
  

  return (
    <div className="min-h-screen bg-gray-50 p-20 pb-20">
      <div className="scroll -mt-16 flex flex-row items-end justify-end gap-2 font-medium">
        <Button className='bg-black text-white hover:bg-black/80  gap-2' onClick={handleLogout}>
        <LogOut className='w-5'/>
        <h1>Log out</h1>
        </Button>
      </div>
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-gray-600">
            Tell us about yourself to get the most out of our platform
          </p>

          <div className="mt-6">
            <ProgressTracker
              sections={sections}
              currentSection={currentSection}
              onSelectSection={(section) => {
                if (section.status !== 'inactive') {
                  handleUpdateSection(
                    section.id as 'profile' | 'company' | 'additional'
                  );
                }
              }}
              progress={progressPercentage}
            />
          </div>
        </header>

        <div className="mt-6 transition-all duration-300">
          {sections.find((section) => section.id === currentSection)?.component}
        </div>
      </div>
    </div>
  );
}
