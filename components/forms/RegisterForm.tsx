"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl
} from "@/components/ui/form"
import CustomFormField from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { PatientFormValidation, UserFormValidation } from "@/lib/validation"
import { createUser, registerPatient } from "@/lib/actions/patient.actions"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Doctors, GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/constants";
import { Label } from "../ui/label";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import FileUploader from "../FileUploader";

export enum FORM_TYPE {
  INPUT = 'input',
  TEXTAREA ='textarea',
  PHONE_INPUT = 'phoneInput',
  CHECKBOX = 'checkbox',
  DATE_PICKER = 'datePicker',
  SELECT = 'select',
  SKELETON = 'skeleton'
}

const RegisterForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit( values: z.infer<typeof PatientFormValidation> ) {
    setIsLoading(true);

    let formData;
    if (values.identification_document && values.identification_document.length > 0) {
      const blobFile = new Blob([values.identification_document[0]], {
        type: values.identification_document[0].type,
      })

      formData = new FormData();
      formData.append('blobFile', blobFile);
      formData.append('fileName', values.identification_document[0].name);
    }

    try {
      const patientData = {
        ...values,
        user_id: user.$id,
        birth_date: new Date(values.birth_date),
        identification_document: formData,
      }

      // @ts-ignore
      const patient = await registerPatient(patientData)

      if (patient) router.push(`/patients/${user.$id}/new-appointment`)

    } catch (error) {
      console.log(error)
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 flex-1">
        <section className="space-y-4">
          <h1 className="header">Welcome!👋</h1>
          <p className="text-dark-700">Let us know more about yourself</p>
        </section>
        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Personal Information</h2>
          </div>
        </section>
        <CustomFormField
          fieldType={FORM_TYPE.INPUT} 
          control={form.control}
          name="name"
          label="Full Name"
          placeholder="Please enter your full name"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FORM_TYPE.INPUT} 
            control={form.control}
            name="email"
            label="Email"
            placeholder="Please enter your email"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />
          <CustomFormField
            fieldType={FORM_TYPE.PHONE_INPUT} 
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="Please enter your phone number"
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FORM_TYPE.DATE_PICKER} 
            control={form.control}
            name="birth_date"
            label="Date of Birth"
          />
          <CustomFormField
            fieldType={FORM_TYPE.SKELETON} 
            control={form.control}
            name="gender"
            label="Gender"
            renderSkeleton={(field) => (
              <FormControl>
                <RadioGroup 
                  className="flex h-11 gap-6 xl:justify-between"
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  {GenderOptions.map((option) => (
                    <div key={option} className="radio-group">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FORM_TYPE.INPUT} 
            control={form.control}
            name="address"
            label="Address"
            placeholder="Please enter your address"
          />
          <CustomFormField
            fieldType={FORM_TYPE.INPUT} 
            control={form.control}
            name="occupation"
            label="Occupation"
            placeholder="Please enter your occupation"
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FORM_TYPE.INPUT} 
            control={form.control}
            name="emergency_contact_name"
            label="Emergency Contact Name"
          />
          <CustomFormField
            fieldType={FORM_TYPE.PHONE_INPUT} 
            control={form.control}
            name="emergency_contact_number"
            label="Emergency Contact Number"
          />
        </div>

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Medical Information</h2>
          </div>
        </section>

        <CustomFormField
          fieldType={FORM_TYPE.SELECT} 
          control={form.control}
          name="primary_physician"
          label="Primary Physician"
          placeholder="Select a physician"
        >
          {Doctors.map((doctor) => (
            <SelectItem key={doctor.name} value={doctor.name}>
              <div className="flex cursor-pointer items-center gap-2">
                <Image 
                  src={doctor.image}
                  width={32}
                  height={32}
                  alt={doctor.name}
                  className="rounded-full border border-dark-500"
                />
                <p>{doctor.name}</p>
              </div>
            </SelectItem>
          ))}
        </CustomFormField>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FORM_TYPE.INPUT} 
            control={form.control}
            name="insurance_provider"
            label="Insurance Provider"
            placeholder="Please enter your insurance provider"
          />
          <CustomFormField
            fieldType={FORM_TYPE.INPUT} 
            control={form.control}
            name="insurance_policy_number"
            label="Insurance Policy Number"
            placeholder="Please enter your insurance policy number"
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FORM_TYPE.TEXTAREA} 
            control={form.control}
            name="allergies"
            label="Allergies (If any)"
            placeholder="Please enter here if you have any allergies"
          />
          <CustomFormField
            fieldType={FORM_TYPE.TEXTAREA} 
            control={form.control}
            name="current_medication"
            label="Current Medication (If any)"
            placeholder="Please enter your current medication"
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FORM_TYPE.TEXTAREA} 
            control={form.control}
            name="family_medical_history"
            label="Family Medical History"
            placeholder="Please enter here if you have any family medical history"
          />
          <CustomFormField
            fieldType={FORM_TYPE.TEXTAREA} 
            control={form.control}
            name="past_medical_history"
            label="Past Medical History"
            placeholder="Please enter your past medical history"
          />
        </div>

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Identification and Verification</h2>
          </div>
        </section>

        <CustomFormField
          fieldType={FORM_TYPE.SELECT} 
          control={form.control}
          name="identification_type"
          label="Identification Type"
          placeholder="Select an identification type"
        >
          {IdentificationTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </CustomFormField>

        <CustomFormField
          fieldType={FORM_TYPE.INPUT} 
          control={form.control}
          name="identification_number"
          label="Identification Number"
          placeholder="Please enter your identification number"
        />

        <CustomFormField
          fieldType={FORM_TYPE.SKELETON} 
          control={form.control}
          name="identification_document"
          label="Scanned copy of Identification Document"
          renderSkeleton={(field) => (
            <FormControl>
              <FileUploader files={field.value} onChange={field.onChange}/>
            </FormControl>
          )}
        />

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Consent and Privacy</h2>
          </div>
        </section>

        <CustomFormField 
          fieldType={FORM_TYPE.CHECKBOX}
          control={form.control}
          name="treatment_consent"
          label="I consent to treatment"
        />
        <CustomFormField 
          fieldType={FORM_TYPE.CHECKBOX}
          control={form.control}
          name="disclosure_consent"
          label="I consent to disclosure of information"
        />
        <CustomFormField 
          fieldType={FORM_TYPE.CHECKBOX}
          control={form.control}
          name="privacy_consent"
          label="I consent to privacy policy"
        />

        <SubmitButton isLoading={isLoading}>Submit</SubmitButton>
      </form>
    </Form>
  )
}

export default RegisterForm;
