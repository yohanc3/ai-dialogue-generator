import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Link } from "lucide-react";

export default function VideoLinkModal({ isOpen, setIsOpen, onSubmit }: { isOpen: boolean; setIsOpen: (value: boolean) => void; onSubmit: () => void }) {
  function closeModal() {
    setIsOpen(false);
  }

  function handleSubmit() {
    closeModal();
    onSubmit();
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Share link to video
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Anyone with the URL will be able to view this video.</p>
                  </div>

                  <div className="mt-4">
                    <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800/90 active:scale-95 duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2" onClick={handleSubmit}>
                      <div className="flex gap-x-2 justify-center items-center">
                        <div>Copy link</div>
                        <Link height={20} width={20} />
                      </div>
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
