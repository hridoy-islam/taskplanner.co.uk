import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Briefcase, Building, Link, Mail, Phone, Map } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileFormData } from '../index';

interface CompanySectionProps {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  onBack: () => void;
  onComplete: () => void;
  isComplete: boolean;
}

export default function CompanySection({
  formData,
  setFormData,
  onBack,
  onComplete,
  isComplete,
  currentQuestion,
  setCurrentQuestion
}: CompanySectionProps) {
  const [animating, setAnimating] = useState(false);

  const updateCompanyField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value
      }
    }));
  };

  const questions = [
    {
      id: 'isEmployed',
      title: 'Are you currently employed?',
      description: 'Let us know about your employment status',
      component: (
        <div className="space-y-6 py-8">
          <div className="flex items-center space-x-3">
            <Switch
              id="isEmployed"
              checked={formData.company.isEmployed}
              onCheckedChange={(checked) =>
                updateCompanyField('isEmployed', checked)
              }
            />
            <Label
              htmlFor="isEmployed"
              className="cursor-pointer text-lg font-medium"
            >
              I am currently employed
            </Label>
          </div>
          <p className="text-sm text-gray-500">
            {formData.company.isEmployed
              ? "Great! We'll ask for some details about your workplace."
              : "That's okay! You can still proceed to the next section."}
          </p>
        </div>
      ),
      isComplete: true // Always complete since it's a toggle
    },
    {
      id: 'companyBasics',
      title: 'Tell us about your company',
      description: 'Share the basic details about your workplace',
      component: (
        <div className="space-y-6 py-4">
          {formData.company.isEmployed ? (
            <>
              <div className="space-y-3">
                <Label
                  htmlFor="companyType"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <Briefcase size={18} className="text-gray-500" />
                  Company Type
                </Label>
                <Select
                  value={formData.company.companyType}
                  onValueChange={(value) =>
                    updateCompanyField('companyType', value)
                  }
                >
                  <SelectTrigger id="companyType">
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="companyName"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <Building size={18} className="text-gray-500" />
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  value={formData.company.companyName}
                  onChange={(e) =>
                    updateCompanyField('companyName', e.target.value)
                  }
                  placeholder="e.g. Acme Inc."
                  className="w-full"
                />
              </div>
            </>
          ) : (
            <div className="rounded-md bg-gray-50 p-4 text-center">
              <p className="text-gray-600">
                You indicated you're not currently employed. You can continue to
                the next section.
              </p>
            </div>
          )}
        </div>
      ),
      isComplete:
        !formData.company.isEmployed ||
        (formData.company.companyType.trim() !== '' &&
          formData.company.companyName.trim() !== '')
    },
    {
      id: 'companyDetails',
      title: 'Additional company details',
      description: 'These details are optional but helpful',
      component: (
        <div className="space-y-5 py-4">
          {formData.company.isEmployed ? (
            <>
              <div className="space-y-3">
                <Label
                  htmlFor="companyAddress"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <Map size={18} className="text-gray-500" />
                  Company Address
                </Label>
                <Input
                  id="companyAddress"
                  type="text"
                  value={formData.company.companyAddress}
                  onChange={(e) =>
                    updateCompanyField('companyAddress', e.target.value)
                  }
                  placeholder="e.g. 123 Business St, New York, NY"
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="companyWebsite"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <Link size={18} className="text-gray-500" />
                  Company Website
                </Label>
                <Input
                  id="companyWebsite"
                  type="url"
                  value={formData.company.companyWebsite}
                  onChange={(e) =>
                    updateCompanyField('companyWebsite', e.target.value)
                  }
                  placeholder="https://example.com"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <Label
                    htmlFor="companyPhone"
                    className="flex items-center gap-2 text-base font-medium"
                  >
                    <Phone size={18} className="text-gray-500" />
                    Company Phone
                  </Label>
                  <Input
                    id="companyPhone"
                    type="tel"
                    value={formData.company.companyPhone}
                    onChange={(e) =>
                      updateCompanyField('companyPhone', e.target.value)
                    }
                    placeholder="+1 (555) 123-4567"
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="companyEmail"
                    className="flex items-center gap-2 text-base font-medium"
                  >
                    <Mail size={18} className="text-gray-500" />
                    Company Email
                  </Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.company.companyEmail}
                    onChange={(e) =>
                      updateCompanyField('companyEmail', e.target.value)
                    }
                    placeholder="contact@example.com"
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                These details are optional
              </p>
            </>
          ) : (
            <div className="rounded-md bg-gray-50 p-4 text-center">
              <p className="text-gray-600">
                You indicated you're not currently employed. You can continue to
                the next section.
              </p>
            </div>
          )}
        </div>
      ),
      isComplete: true // Always complete since these fields are optional
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

        <div className="flex justify-between bg-gray-50 p-4">
          {currentQuestion === 0 ? (
            <Button
              variant="ghost"
              onClick={onBack}
              className="bg-taskplanner text-white hover:bg-taskplanner"
            >
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={goToPreviousQuestion}
              className="bg-taskplanner text-white hover:bg-taskplanner/90"
            >
              Back
            </Button>
          )}

          {isLastQuestion || !formData.company.isEmployed ? (
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
  );
}
