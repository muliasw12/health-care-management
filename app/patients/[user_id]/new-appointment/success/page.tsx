import { Button } from '@/components/ui/button';
import { Doctors } from '@/constants';
import { getAppointment } from '@/lib/actions/appointment.actions';
import { formatDateTime } from '@/lib/utils';
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Success = async ({ params: { user_id }, searchParams}: SearchParamProps) => {
  const appointment_id = (searchParams?.appointment_id as string) || '';
  const appointment = await getAppointment(appointment_id);
  const doctor = Doctors.find((doc) => doc.name === appointment.primary_physician)
  return (
    <div className="flex h-screen max-h-screen px-[5%]">
      <div className="success-img">
        <Link href="/">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="h-10 w-fit"
          />
        </Link>

        <section className="flex flex-col items-center">
          <Image 
            src="/assets/gifs/success.gif"
            height={300}
            width={200}
            alt="success"
          />
          <h2 className="header mb-6 max-w-[600px] text-center">
            Your <span className="text-green-500">appointment request</span> has been successfully submitted!
          </h2>
          <p>We&apos;ll be in touch shortly to confirm</p>
        </section>

        <section className="request-details">
          <p>Request appointment details:</p>
          <div className="flex items-center gap-3">
            <Image 
              src={doctor?.image!}
              alt="doctor"
              width={100}
              height={100}
              className="size-6"
            />
            <p className="whitespace-nowrap">dr. {doctor?.name}</p>
          </div>
          <div className="flex gap-2">
            <Image 
              src="/assets/icons/calendar.svg"
              width={24}
              height={24}
              alt="calendar"
            />
            <p>{formatDateTime(appointment.schedule).dateTime}</p>
          </div>
        </section>

        <div className="flex flex-row items-center gap-8">
          <Button variant="outline" className="shad-primary-btn" asChild>
            <Link href={`/patients/${user_id}/new-appointment`}>
              New Appointment
            </Link>
          </Button>

          <Button variant="outline" className="shad-primary-btn px-8" asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>

        <p className="copyright">© 2024 Careplus</p>
      </div>
    </div>
  )
}

export default Success