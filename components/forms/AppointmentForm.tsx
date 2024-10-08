"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form
} from "@/components/ui/form"
import CustomFormField from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { Dispatch, SetStateAction, useState } from "react"
import { getAppointmentSchema } from "@/lib/validation"
import { createUser } from "@/lib/actions/patient.actions"
import { useRouter } from "next/navigation"
import { Doctors } from "@/constants";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions";
import { Appointment } from "@/types/appwrite.types";

export enum FORM_TYPE {
  INPUT = 'input',
  TEXTAREA ='textarea',
  PHONE_INPUT = 'phoneInput',
  CHECKBOX = 'checkbox',
  DATE_PICKER = 'datePicker',
  SELECT = 'select',
  SKELETON = 'skeleton'
}


const AppointmentForm = ({ user_id, patient_id, type, appointment, setOpen }: { 
    user_id: string;
    patient_id: string; 
    type: "create" | "cancel" | "schedule";
    appointment?: Appointment;
    setOpen?: Dispatch<SetStateAction<boolean>>;
  }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primary_physician: appointment ? appointment?.primary_physician : "",
      schedule: appointment ? new Date(appointment?.schedule) : new Date(Date.now()),
      reason: appointment ? appointment?.reason : "",
      note: appointment?.note || "",
      cancellation_reason: appointment?.cancellation_reason || "",
    },
  });

  async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
    setIsLoading(true);

    let status;
    switch (type) {
      case 'schedule':
        status = 'scheduled';
        break;
      case 'cancel':
        status = 'cancelled';
        break;
      default:
        status = 'pending';
        break;
    }

    try {
      if (type === 'create' && patient_id) {
        const appointmentData = {
          user_id, 
          patient: patient_id,
          primary_physician: values.primary_physician,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          note: values.note,
          status: status as Status
        }
        const appointment = await createAppointment(appointmentData);

        if (appointment) {
          form.reset();
          router.push(`/patients/${user_id}/new-appointment/success?appointment_id=${appointment.$id}`);
        }
      } else {
        const appointmentToUpdate = {
          user_id,
          appointment_id: appointment?.$id!,
          appointment: {
            primary_physician: values?.primary_physician,
            schedule: new Date(values?.schedule),
            status: status as Status,
            cancellation_reason: values?.cancellation_reason
          },
          type
        }

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }


    } catch (error) {
      console.log(error)
    }
  };

  let buttonLabel;

  switch (type) {
    case 'cancel':
      buttonLabel = 'Cancel Appointment';
      break;
    case 'create':
      buttonLabel = 'Create Appointment';
      break;
    case 'schedule':
      buttonLabel = 'Schedule Appointment';
      break;
    default:
      break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex-1">
        {type === 'create' && <section className="mb-12 space-y-4">
          <h1 className="header">New Appointment</h1>
          <p className="text-dark-700">Request a new appointment</p>
        </section>}

        {type !== "cancel" && (
          <>
            <CustomFormField
              fieldType={FORM_TYPE.SELECT} 
              control={form.control}
              name="primary_physician"
              label="Doctor"
              placeholder="Select a doctor"
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

            <CustomFormField 
              fieldType={FORM_TYPE.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected schedule appointment"
              showTimeSelect
              dateFormat="MM/dd/yyyy - h:mm aa"
            /> 

            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField 
                fieldType={FORM_TYPE.TEXTAREA}
                control={form.control}
                name="reason"
                label="Reason for appointment"
                placeholder="Enter reason for appointment"
              />
              <CustomFormField 
                fieldType={FORM_TYPE.TEXTAREA}
                control={form.control}
                name="note"
                label="Notes"
                placeholder="Enter notes"
              />
            </div> 
          </>
        )}

        {type === 'cancel' && (
          <CustomFormField
            fieldType={FORM_TYPE.TEXTAREA}
            control={form.control}
            name="cancellation_reason"
            label="Reason for cancellation"
            placeholder="Enter reason for cancellation"
          />
        )}
        <SubmitButton 
          isLoading={isLoading} 
          className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  )
}

export default AppointmentForm;
