import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';

import { Link } from 'react-router-dom';

export default function Otp() {
  const [otp, setOtp] = useState(Array(4).fill('')); // Array with 6 empty strings
  const inputRefs = useRef([]);

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

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    console.log('OTP:', otpCode);
  };

  return (
    <>
      <div className="container grid h-svh flex-col items-center justify-center bg-primary lg:max-w-none lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
          <div className="mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-1/2" />
          </div>
          <Card className="p-6">
            <div className="mb-2 flex flex-col space-y-2 text-left">
              <h1 className="text-md font-semibold tracking-tight">
                Verification Code
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter the verification code sent to your email
              </p>
              <section className="dark:bg-dark bg-white py-10">
                <div className="container">
                  <div>
                    <p className="text-dark mb-1.5 text-sm font-medium dark:text-white">
                      Secure code
                    </p>
                    <form id="otp-form" className="flex gap-2">
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
                          className="shadow-xs border-stroke text-gray-5 dark:border-dark-3 flex w-[64px] items-center justify-center rounded-lg border bg-white p-2 text-center text-2xl font-medium outline-none dark:bg-white/5 sm:text-4xl"
                        />
                      ))}
                    </form>
                    <Button
                      disabled={otp.some((digit) => digit === '')}
                      onClick={handleOtpSubmit}
                      className="ml-auto mt-5 w-full bg-white text-[#0e3261] hover:bg-[#0e3261] hover:text-white"
                      variant="outline"
                    >
                      Verify OTP
                    </Button>
                  </div>
                </div>
              </section>
            </div>
            {/* <ForgotForm /> */}
            <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/sign-up"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </Link>
              .
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
