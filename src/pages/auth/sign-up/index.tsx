import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { SignUpForm } from './components/sign-up-form';
import taskplan from '@/assets/imges/home/regimg.png';
import logo from '@/assets/imges/home/logos/tlogo.png';

export default function SignUpPage() {
  return (
    <div className="grid h-screen lg:grid-cols-2 lg:px-0">
      <div
        className="relative hidden h-full flex-col border-r border-gray-200 p-8 text-black dark:border-r dark:text-white lg:flex"
        style={{
          background: `url(${taskplan}) center/contain no-repeat, white`,
        }}
      >
        <div className="z-20 flex scale-90 items-center text-lg font-semibold -mt-20 right-10 relative">
          <img src={logo} alt="logo" />
        </div>

        <div className="z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg font-semibold text-black">
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than ever
              before.&rdquo;
            </p>
            <footer className="text-sm font-medium text-black">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Sign Up Form */}
      <div className="flex h-full items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="p-6">
            <div className="mb-2 flex flex-col space-y-2 text-left">
              <h1 className="text-lg font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and password to create an account. <br />
                Already have an account?{' '}
                <Link to="/login" className="underline underline-offset-4">
                  Sign In
                </Link>
              </p>
            </div>
            <SignUpForm />
            <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
              By creating an account, you agree to our{' '}
              <a
                href="/terms"
                className="underline underline-offset-4 hover:pointer"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:pointer"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
