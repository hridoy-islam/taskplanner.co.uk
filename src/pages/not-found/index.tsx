import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function NotFound() {
  const navigate = useNavigate();
  // accessing state.auth.user
  const { user } = useSelector((state: any) => state.auth);

  const handleBackToHome = () => {
    // 1. If not logged in, go to root (Login)
    if (!user) {
      navigate('/');
      return;
    }

    // 2. If logged in, route based on role
    if (user.role === 'admin') {
      navigate('/dashboard/admin');
    } 
    else if (user.role === 'company') {
      // Assuming user._id is the company ID for company role
      navigate(`/company/${user._id}`);
    } 
    else {
      // Employee/User role
      navigate(`/company/${user.company}/user/${user._id}`);
    }
  };

  return (
    <div className="absolute left-1/2 top-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center">
      <span className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent">
        404
      </span>
      <h2 className="font-heading my-2 text-2xl font-bold">
        Something&apos;s missing
      </h2>
      <p>
        Sorry, the page you are looking for doesn&apos;t exist or has been
        moved.
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <Button onClick={handleBackToHome} variant="ghost" size="lg">
          Back to Home
        </Button>
      </div>
    </div>
  );
}