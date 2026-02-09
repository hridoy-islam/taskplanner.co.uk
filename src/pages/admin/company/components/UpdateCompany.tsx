import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Building2 } from 'lucide-react';
import Select from 'react-select';
import axiosInstance from '@/lib/axios';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

// Utils
import { convertToLowerCase } from '@/lib/utils';
import { countries } from '@/types'; // Ensure this import exists in your project

// Schema - Matches CreateCompany but Password is optional
const formSchema = z.object({
  // Basic Info
  name: z.string().min(2, { message: 'Company name is required.' }),
  email: z.string().email({ message: 'Valid email is required.' }),
  phone: z.string().min(1, { message: 'Phone number is required.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' })
    .optional()
    .or(z.literal('')),

  // Address
  address: z.string().min(1, { message: 'Address Line 1 is required.' }),
  address2: z.string().optional(),
  country: z.string().optional(),
  cityOrTown: z.string().optional(),
  stateOrProvince: z.string().optional(),
  postcode: z.string().optional(),

  // Finance & Branding
  accountNo: z.string().optional(),
  sortCode: z.string().optional(),
  beneficiaryName: z.string().optional(),
  themeColor: z.string().optional(),

  // Internal
  authorized: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateCompanyProps {
  companyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export default function UpdateCompany({
  companyId,
  open,
  onOpenChange,
  onUserUpdated
}: UpdateCompanyProps) {
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(false);

  const countryOptions = countries.map((c: any) => ({
    label: c.name || c,
    value: c.name || c
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      address: '',
      address2: '',
      country: '',
      cityOrTown: '',
      stateOrProvince: '',
      postcode: '',
      accountNo: '',
      sortCode: '',
      beneficiaryName: '',
      themeColor: '#000000',
      authorized: false
    }
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue
  } = form;

  const watchedThemeColor = watch('themeColor');

  // Fetch Data on Open
  useEffect(() => {
    if (open && companyId) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const res = await axiosInstance.get(`/users/${companyId}`);
          const userData = res.data.data;

          // Map API response to Form Schema
          reset({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            password: '', // Always empty on load

            // Address
            address: userData.address || '',
            address2: userData.address2 || '',
            country: userData.country || '',
            cityOrTown: userData.cityOrTown || '',
            stateOrProvince: userData.stateOrProvince || '',
            postcode: userData.postcode || '',

            // Finance & Branding
            accountNo: userData.accountNo || '',
            sortCode: userData.sortCode || '',
            beneficiaryName: userData.beneficiaryName || '',
            themeColor: userData.themeColor || '#000000',

            authorized: userData.authorized || false
          });
        } catch (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Error fetching company details'
          });
          onOpenChange(false);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, companyId, reset, onOpenChange, toast]);

  const onSubmit = async (values: FormValues) => {
    if (!companyId) return;

    // Filter out empty password if not changed
    const payload: any = {
      ...values,
      email: convertToLowerCase(values.email),
      isValided: values.authorized,
      authorized: values.authorized
    };

    // Only send password if user typed something
    if (values.password && values.password.length >= 6) {
      payload.password = values.password;
    } else {
      delete payload.password;
    }

    try {
      await axiosInstance.patch(`/users/${companyId}`, payload);

      toast({
        title: 'Success',
        description: 'Company details updated successfully.',
        variant: 'default'
      });

      onOpenChange(false);
      onUserUpdated();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description:
          error?.response?.data?.message || 'Could not update company details.'
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-full overflow-y-auto sm:max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            Edit Company
          </DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Column 1: Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="bg-theme h-6 w-1 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">
                    Basic Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      className={
                        errors.name ? 'w-full border-red-500' : 'w-full'
                      }
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={
                        errors.email ? 'w-full border-red-500' : 'w-full'
                      }
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      className={
                        errors.phone ? 'w-full border-red-500' : 'w-full'
                      }
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password">Change Password (Optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave blank to keep current"
                      {...register('password')}
                      className={
                        errors.password ? 'w-full border-red-500' : 'w-full'
                      }
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="bg-theme h-6 w-1 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">
                    Address Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">
                      Address Line 1 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      {...register('address')}
                      className={
                        errors.address ? 'w-full border-red-500' : 'w-full'
                      }
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input
                      className="w-full"
                      id="address2"
                      {...register('address2')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Controller
                        control={control}
                        name="country"
                        render={({ field: { onChange, value, ref } }) => (
                          <Select
                            ref={ref}
                            options={countryOptions}
                            value={
                              countryOptions.find(
                                (c: any) => c.value === value
                              ) || null
                            }
                            onChange={(val: any) => onChange(val?.value)}
                            placeholder="Select..."
                            classNamePrefix="react-select"
                            styles={{
                              control: (base, state) => ({
                                ...base,
                                borderRadius: '8px',
                                borderColor: errors.country
                                  ? 'rgb(239, 68, 68)'
                                  : '#e2e8f0',
                                boxShadow: state.isFocused
                                  ? '0 0 0 1px rgba(0,0,0,0.1)'
                                  : 'none',
                                '&:hover': {
                                  borderColor: errors.country
                                    ? 'rgb(239, 68, 68)'
                                    : '#cbd5e1'
                                },
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem'
                              }),
                              menu: (base) => ({
                                ...base,
                                borderRadius: '8px',
                                zIndex: 9999
                              })
                            }}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cityOrTown">City/Town</Label>
                      <Input id="cityOrTown" {...register('cityOrTown')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stateOrProvince">State/Province</Label>
                      <Input
                        className="w-full"
                        id="stateOrProvince"
                        {...register('stateOrProvince')}
                      />
                    </div>
                    <div>
                      <Label className="w-full" htmlFor="postcode">
                        Postcode
                      </Label>
                      <Input id="postcode" {...register('postcode')} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Finance & Branding */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="bg-theme h-6 w-1 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">
                    Finance, Branding & Access
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="w-full">
                    <Label htmlFor="accountNo">Account No</Label>
                    <Input
                      className="w-full"
                      id="accountNo"
                      {...register('accountNo')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortCode">Sort Code</Label>
                    <Input
                      className="w-full"
                      id="sortCode"
                      {...register('sortCode')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                    <Input
                      className="w-full"
                      id="beneficiaryName"
                      {...register('beneficiaryName')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="themeColor">Theme Color</Label>
                    <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-300 p-1 shadow-sm">
                      <input
                        id="themeColor"
                        type="color"
                        className="h-9 w-12 cursor-pointer border-none bg-transparent"
                        {...register('themeColor')}
                      />
                      <div className="mx-1 h-6 w-px bg-gray-200"></div>
                      <span className="flex-1 font-mono text-sm text-gray-600">
                        {watchedThemeColor}
                      </span>
                    </div>
                  </div>

                  {/* Access Control (Checkbox) */}
                  <div className="pt-2">
                    <Controller
                      control={control}
                      name="authorized"
                      render={({ field }) => (
                        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                            className="mt-0.5"
                          />
                          <div className="space-y-1 leading-none">
                            <Label className="cursor-pointer font-medium">
                              Authorize Company
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Grant this company valid status and access.
                            </p>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="-mx-6 -mb-6 mt-4 flex justify-end gap-3 border-t bg-gray-50 p-4 pt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
