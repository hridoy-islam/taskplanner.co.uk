import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileFormData } from '../index';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Info, Search, Building2, Users } from 'lucide-react';



export default function AdditionalInfoSection({
  formData,
  setFormData,
  onBack,
  onComplete,
  isSubmitting,
  isComplete,
  currentQuestion,
  setCurrentQuestion,
}) {
  const [animating, setAnimating] = useState(false);
const handleBack = () => {
  if (currentQuestion > 0) {
    setCurrentQuestion(currentQuestion - 1);
  } else {
    onBack(); // parent section
  }
};
  // Load saved question position from localStorage if it exists
  useEffect(() => {
    const savedQuestionPosition = localStorage.getItem(
      'additional_section_question'
    );
    if (savedQuestionPosition) {
      setCurrentQuestion(parseInt(savedQuestionPosition, 10));
    }
  }, []);

  // Save current question position when it changes
   useEffect(() => {
    localStorage.setItem('additional_section_question', currentQuestion.toString());
  }, [currentQuestion]);

  const updateField = (field: string, value: string) => {
    const updatedFormData = {
      ...formData,
      additionalInfo: {
        ...formData.additionalInfo,
        [field]: value
      }
    };
    setFormData(updatedFormData);
    localStorage.setItem('profile_form_data', JSON.stringify(updatedFormData));
  };

  const questions = [
    {
      id: 'howDidYouHear',
      title: 'How did you hear about us?',
      description: "We'd love to know how you discovered our platform",
      component: (
        <div className="space-y-4 py-6">
          <div className="space-y-3">
            <Label
              htmlFor="howDidYouHear"
              className="flex items-center gap-2 text-base font-medium"
            >
              <Search size={18} className="text-gray-500" />
              Source
            </Label>
            <Select
              value={formData.additionalInfo.howDidYouHear}
              onValueChange={(value) => updateField('howDidYouHear', value)}
            >
              <SelectTrigger id="howDidYouHear">
                <SelectValue placeholder="Select how you found us" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="search">Search Engine</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="friend">Friend/Colleague</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      isComplete: formData.additionalInfo.howDidYouHear.trim() !== ''
    },
    {
      id: 'industryType',
      title: 'What industry do you work in?',
      description: 'This helps us tailor our content to your needs',
      component: (
        <div className="space-y-4 py-6">
          <div className="space-y-3">
            <Label
              htmlFor="industryType"
              className="flex items-center gap-2 text-base font-medium"
            >
              <Building2 size={18} className="text-gray-500" />
              Industry Type
            </Label>
            <Select
              value={formData.additionalInfo.industryType}
              onValueChange={(value) => updateField('industryType', value)}
            >
              <SelectTrigger id="industryType">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">IT & Technology</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      isComplete: formData.additionalInfo.industryType.trim() !== ''
    },
    {
      id: 'numberOfEmployees',
      title: 'How large is your organization?',
      description: 'Tell us about the size of your company',
      component: (
        <div className="space-y-4 py-6">
          <div className="space-y-3">
            <Label
              htmlFor="numberOfEmployees"
              className="flex items-center gap-2 text-base font-medium"
            >
              <Users size={18} className="text-gray-500" />
              Number of Employees
            </Label>
            <Select
              value={formData.additionalInfo.numberOfEmployees}
              onValueChange={(value) => updateField('numberOfEmployees', value)}
            >
              <SelectTrigger id="numberOfEmployees">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10</SelectItem>
                <SelectItem value="11-50">11-50</SelectItem>
                <SelectItem value="51-200">51-200</SelectItem>
                <SelectItem value="201-500">201-500</SelectItem>
                <SelectItem value="500+">500+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      isComplete: formData.additionalInfo.numberOfEmployees.trim() !== ''
    },
    {
      id: 'completion',
      title: "",
      description: '',
      component: (
        <div className="space-y-8 py-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-lg">
            <Info size={36} className="text-green-600" />
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-semibold text-gray-900">
            You're all set!
            </h3>
            <p className="text-gray-700 text-xl">
            Thank you for completing your profile information
            </p>
          </div>

          <div className="pt-6">
            <Button
              onClick={onComplete}
              disabled={isSubmitting || !isComplete}
              className="mx-auto w-full max-w-md rounded-lg bg-blue-600 px-8 py-3 text-white transition duration-300 ease-in-out hover:bg-blue-700"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Getting Started'
              )}
            </Button>
          </div>
        </div>
      ),
      isComplete: isComplete
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
  
  const isCurrentQuestionComplete =
    questions[currentQuestion]?.isComplete || false;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <Card className="overflow-hidden bg-white shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <div
            className={`transform transition-all duration-300 ${animating ? 'translate-x-10 opacity-0' : 'translate-x-0 opacity-100'}`}
          >
            <div className="px-6 pt-6">
              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                {questions[currentQuestion]?.title}
              </h2>
              <p className="text-gray-600">
                {questions[currentQuestion]?.description}
              </p>
            </div>

            <div className="p-6">{questions[currentQuestion]?.component}</div>
          </div>
        </div>

        {!isLastQuestion && (
          <div className="flex justify-between bg-gray-50 p-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="bg-taskplanner text-white hover:bg-taskplanner/90"
            >
              Back
            </Button>

            <Button
              onClick={() => {
                localStorage.setItem(
                  'profile_form_data',
                  JSON.stringify(formData)
                );
                goToNextQuestion();
              }}
              disabled={!isCurrentQuestionComplete}
              className="bg-taskplanner text-white hover:bg-taskplanner/90"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
