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
import { requestOtp } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import taskplan from '@/assets/imges/home/forget.png';
import logo from '@/assets/imges/home/logos/tlogo.png';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function ForgotPassword() {
  const { loading, error } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const defaultValues = {
    email: '',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    const result: any = await dispatch(requestOtp(data));
    if (result?.payload?.success) {
      localStorage.setItem('tp_otp_email', data.email);
      router.push('/otp');
    }
  };

  return (
    <>
      <div className="grid h-screen md:grid-cols-2 lg:px-0">
        <div
          className="relative hidden h-full flex-col border-gray-200 p-8 text-black dark:border-r lg:flex"
          style={{
            background: `url(${taskplan}) center/contain no-repeat, white`
          }}
        >
          <Link to="/">
          <div className="relative right-10 z-20 -mt-20 flex scale-90 cursor-pointer items-center text-lg font-semibold">
            <img src={logo} alt="logo" />
          </div>
        </Link>
        </div>

        {/* Right Form Panel */}
        <div className="flex h-full items-center justify-center p-4 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
           
            <Card className="p-6">
              <div className="mb-2 flex flex-col space-y-2 text-left">
                <h1 className="text-md font-semibold tracking-tight">
                  Forgot Password
                </h1>
                <p className="text-sm text-muted">
                  Enter your registered email and <br /> we will send you a link
                  to reset your password.
                </p>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full space-y-2"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email..."
                              disabled={loading}
                              {...field}
                              className="w-full"
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
                      Reset Password
                    </Button>
                  </form>
                </Form>
              </div>
              {/* <ForgotForm /> */}
              <p className="mt-4 px-8 text-center text-sm text-muted">
                Don't have an account?{' '}
                <Link to="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
                .
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
