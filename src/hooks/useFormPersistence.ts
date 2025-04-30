// hooks/useFormPersistence.ts
import { ProfileFormData } from '@/pages/personalInformation';
import { useEffect } from 'react';

type FormPersistenceProps = {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  currentSection: 'profile' | 'company' | 'additional';
  setCurrentSection: React.Dispatch<React.SetStateAction<'profile' | 'company' | 'additional'>>;
  profileQuestion: number;
  setProfileQuestion: React.Dispatch<React.SetStateAction<number>>;
  companyQuestion: number;
  setCompanyQuestion: React.Dispatch<React.SetStateAction<number>>;
  additionalQuestion: number;
  setAdditionalQuestion: React.Dispatch<React.SetStateAction<number>>;
};

const STORAGE_KEYS = {
  FORM_DATA: 'profile_form_data',
  CURRENT_SECTION: 'profile_current_section',
  QUESTION_INDEX: (section: 'profile' | 'company' | 'additional') => `question_index_${section}`,
};

export const useFormPersistence = ({
  formData,
  setFormData,
  currentSection,
  setCurrentSection,
  profileQuestion,
  setProfileQuestion,
  companyQuestion,
  setCompanyQuestion,
  additionalQuestion,
  setAdditionalQuestion,
}: FormPersistenceProps) => {
  // Load saved form data and section/question indices
  useEffect(() => {
    const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
    const savedSection = localStorage.getItem(STORAGE_KEYS.CURRENT_SECTION) as
      | 'profile'
      | 'company'
      | 'additional'
      | null;

    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData) as ProfileFormData;
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }

    if (savedSection) {
      setCurrentSection(savedSection);
    }

    const savedProfileQuestion = localStorage.getItem(STORAGE_KEYS.QUESTION_INDEX('profile'));
    if (savedProfileQuestion) {
      setProfileQuestion(parseInt(savedProfileQuestion, 10));
    }

    const savedCompanyQuestion = localStorage.getItem(STORAGE_KEYS.QUESTION_INDEX('company'));
    if (savedCompanyQuestion) {
      setCompanyQuestion(parseInt(savedCompanyQuestion, 10));
    }

    const savedAdditionalQuestion = localStorage.getItem(STORAGE_KEYS.QUESTION_INDEX('additional'));
    if (savedAdditionalQuestion) {
      setAdditionalQuestion(parseInt(savedAdditionalQuestion, 10));
    }
  }, [setFormData, setCurrentSection, setProfileQuestion, setCompanyQuestion, setAdditionalQuestion]);

  // Save form data and section/question indices
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SECTION, currentSection);
  }, [currentSection]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTION_INDEX('profile'), profileQuestion.toString());
  }, [profileQuestion]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTION_INDEX('company'), companyQuestion.toString());
  }, [companyQuestion]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTION_INDEX('additional'), additionalQuestion.toString());
  }, [additionalQuestion]);

  const saveFormState = () => {
    localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
    localStorage.setItem(STORAGE_KEYS.CURRENT_SECTION, currentSection);
    localStorage.setItem(STORAGE_KEYS.QUESTION_INDEX('profile'), profileQuestion.toString());
    localStorage.setItem(STORAGE_KEYS.QUESTION_INDEX('company'), companyQuestion.toString());
    localStorage.setItem(STORAGE_KEYS.QUESTION_INDEX('additional'), additionalQuestion.toString());
  };

  const clearSavedState = () => {
    localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SECTION);
    localStorage.removeItem(STORAGE_KEYS.QUESTION_INDEX('profile'));
    localStorage.removeItem(STORAGE_KEYS.QUESTION_INDEX('company'));
    localStorage.removeItem(STORAGE_KEYS.QUESTION_INDEX('additional'));
  };

  return { saveFormState, clearSavedState };
};