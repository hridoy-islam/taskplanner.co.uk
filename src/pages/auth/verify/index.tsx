import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { validateRequestOtp } from '@/redux/features/authSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import taskplan from '@/assets/imges/home/otp.png';
import logo from '@/assets/imges/home/logos/tlogo.png';
import { Link } from 'react-router-dom';
import  axiosInstance  from '@/lib/axios';

export default function VerifyPage() {
  const [otp, setOtp] = useState(Array(4).fill(''));
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isCooldownActive, setIsCooldownActive] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const inputRefs = useRef([]);
  const router = useRouter();
  const email = localStorage.getItem('tp_otp_email');
  const { user } = useSelector((state: RootState) => state.auth);

  const handleKeyDown = (e) => {
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab' &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      const index = inputRefs.current.indexOf(e.target);
      if (index > 0) {
        setOtp((prevOtp) => [
          ...prevOtp.slice(0, index - 1),
          '',
          ...prevOtp.slice(index)
        ]);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleInput = (e) => {
    const { target } = e;
    const index = inputRefs.current.indexOf(target);
    if (target.value) {
      setOtp((prevOtp) => [
        ...prevOtp.slice(0, index),
        target.value,
        ...prevOtp.slice(index + 1)
      ]);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (!new RegExp(`^[0-9]{${otp.length}}$`).test(text)) {
      return;
    }
    const digits = text.split('');
    setOtp(digits);
  };

  // const handleOtpSubmit = async (e) => {
  //   e.preventDefault();
  //   const otpCode = otp.join('');
  //   if (!email) router.push('/forgot-password');
  //   const result: any = await dispatch(
  //     validateRequestOtp({ email, otp: otpCode })
  //   );
  //   if (result?.payload?.success) {
  //     const decoded = jwtDecode(result?.payload?.data?.resetToken);
  //     localStorage.setItem(
  //       'tp_user_data',
  //       JSON.stringify({ ...decoded, token: result?.payload?.data?.resetToken })
  //     );
  //     router.push('/new-password');
  //   } else {
  //     setError('Invalid OTP');
  //   }
  // };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
  
    if (!user?.email) {
      setError('Email missing');
      return;
    }
  
    try {
      const response = await axiosInstance.patch('auth/verifyemail', {
        email: user.email,
        otp: otpCode,
      });
  
      const { success, data } = response.data;
  
      if (success) {
        const decoded = jwtDecode(data.accessToken);
  
        localStorage.setItem(
          'taskplanner',
          JSON.stringify({ ...decoded, token: data.accessToken })
        );
  
        router.push('/dashboard');
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try again.');
    }
  };
  

  const handleResendOtp = async () => {
    try {
      console.log('Resending OTP to', email);
      // TODO: Replace this with your actual resend OTP logic
      // await dispatch(resendOtp({ email }));
      setResendCooldown(30);
      setIsCooldownActive(true);
    } catch (err) {
      console.error(err);
      setError('Failed to resend OTP. Please try again.');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldownActive && resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else if (resendCooldown === 0) {
      setIsCooldownActive(false);
    }
    return () => clearTimeout(timer);
  }, [isCooldownActive, resendCooldown]);

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4 lg:px-0">
  <div className="w-full max-w-md space-y-6">
    <Card className="p-6 shadow-lg border border-gray-200">
      <div className="flex flex-col space-y-4 text-center">
        <h2 className="text-xl font-medium text-gray-900">
        VERIFY YOUR EMAIL ADDRESS
        </h2>
        <div>
        <p className="text-gray-700 font-medium">
            A verification code has been sent to
            <br />
            <span className="font-bold text-sm ">{user?.email}</span>
          </p>
        </div>
        <p className="text-sm text-gray-600">
            Please check your inbox and enter the verification code below to verify your email address. 

          </p>


        {error && <p className="text-sm text-red-500">{error}</p>}

        <form
          id="otp-form"
          className="flex justify-between gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleOtpSubmit(e);
          }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[index] = el)}
              className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-center text-xl font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary sm:h-14 sm:w-14 sm:text-2xl"
            />
          ))}
        </form>

        <Button
          disabled={otp.some((digit) => digit === '')}
          onClick={handleOtpSubmit}
          className="mt-4 w-full bg-taskplanner text-white"
        >
          Verify OTP
        </Button>

        <div className="mt-2 flex items-center justify-center space-x-1 text-sm">
          <span className="text-gray-600">
            Didn&apos;t receive the code?
          </span>
          <button
            className={`font-medium text-black transition-opacity duration-200 ${isCooldownActive ? 'cursor-not-allowed opacity-70' : 'hover:text-black/90'}`}
            onClick={handleResendOtp}
            disabled={isCooldownActive}
            type="button"
          >
            {isCooldownActive ? (
              <span className="flex items-center">
                <svg
                  className="mr-1 h-3 w-3 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Resend in {resendCooldown}s
              </span>
            ) : (
              <span className="text-gray-600 font-semibold hover:underline">Resend code</span>
            )}
          </button>
        </div>
      </div>
    </Card>
  </div>
</div>

  );
}
