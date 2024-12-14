import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { changePassword } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { Link } from 'react-router-dom';
import { z } from 'zod';

const formSchema = z.object({
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function NewPassword() {
  const { loading } = useSelector((state: any) => state.auth);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const defaultValues = {
    password: '',
    confirmPassword: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const userData = JSON.parse(localStorage.getItem('tp_user_data'));
    // console.log({token: userData.token, password: data.password, userId: userData._id });
    const result: any = await dispatch(
      changePassword({
        token: userData.token,
        password: data.password,
        userId: userData._id
      })
    );
    if (result?.payload?.success) {
      setError('');
      localStorage.removeItem('tp_user_data');
      localStorage.removeItem('tp_otp_email');
      setMessage('Password changed successfully');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('tp_user_data') === null) router.push('/login');
  }, []);

  return (
    <>
      <div className="container grid h-svh flex-col items-center justify-center bg-primary lg:max-w-none lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
          <div className="mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-1/2" />
          </div>
          <Card className="p-6">
            <div className="mb-2 flex flex-col space-y-2 text-left">
              <div className="mb-5 space-x-3">
                <h1 className="text-md font-semibold tracking-tight">
                  Enter new password
                </h1>
                <p className="text-sm text-muted">
                  Enter your new password to login.
                </p>
                {error ? (
                  <p className="mt-4 text-sm text-red-500">{error}</p>
                ) : null}
                {message && (
                  <p className="text-sm text-[#3b82f6]">
                    {message}{' '}
                    <Link to="/login" className="underline underline-offset-4 ">
                      Login Now
                    </Link>
                  </p>
                )}
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password..."
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your password..."
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    disabled={loading}
                    className="ml-auto w-full bg-background text-white hover:bg-background"
                    type="submit"
                  >
                    Submit
                  </Button>
                </form>
              </Form>
            </div>
            {/* <ForgotForm /> */}
            <p className="mt-4 px-8 text-center text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/sign-up" className="underline underline-offset-4">
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
