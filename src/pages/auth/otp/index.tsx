import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { validateRequestOtp } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { jwtDecode } from 'jwt-decode';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import taskplan from '@/assets/imges/home/otp.png';
import logo from '@/assets/imges/home/logos/tlogo.png';
import { Link } from 'react-router-dom';

export default function Otp() {
  const [otp, setOtp] = useState(Array(4).fill(''));
  const [error, setError] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const inputRefs = useRef([]);
  const router = useRouter();
  const email = localStorage.getItem('tp_otp_email');

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

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (!email) router.push('/forgot-password');
    const result: any = await dispatch(
      validateRequestOtp({ email, otp: otpCode })
    );
    if (result?.payload?.success) {
      const decoded = jwtDecode(result?.payload?.data?.resetToken);
      localStorage.setItem(
        'tp_user_data',
        JSON.stringify({ ...decoded, token: result?.payload?.data?.resetToken })
      );
      router.push('/new-password');
    } else {
      setError('Invalid OTP');
    }
  };

  return (
    <div className="grid h-screen md:grid-cols-2 lg:px-0">
      {/* Left Image Panel - Fixed implementation */}
      <div
        className="relative hidden h-full flex-col border-gray-200 p-8 text-black dark:border-r lg:flex"
        style={{
          background: `url(${taskplan}) center/contain no-repeat, white`
        }}
      >
        <div className="relative right-10 z-20 -mt-20 flex scale-90 items-center text-lg font-semibold">
          <img src={logo} alt="logo" />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex h-full items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-6 shadow-md">
            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-lg font-semibold tracking-tight">
                Verification Code
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter the verification code sent to your email.
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}

              <form
                id="otp-form"
                className="mt-4 flex justify-between gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleOtpSubmit();
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
                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-center text-xl font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary sm:h-16 sm:w-16 sm:text-3xl"
                  />
                ))}
              </form>

              <Button
                disabled={otp.some((digit) => digit === '')}
                onClick={handleOtpSubmit}
                className="mt-5 w-full"
              >
                Verify OTP
              </Button>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="hover:pointer underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
