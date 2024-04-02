"use client"

export default function SignInOutButton({signInOut, children, className}: {signInOut: () => void, className: string, children: any}){

  return (
    <button className={className} onClick={() => signInOut()}>
      {children}
    </button>
  )

}