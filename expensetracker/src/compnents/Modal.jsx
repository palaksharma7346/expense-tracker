import React from 'react'

const Modal = ({isOpen, onClose, title, children}) => {

    if(!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center'>
        <div className=' relative w-full max-w-2xl p-4 '>
            <div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
                <div className='flex items-start justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200'>
                    <h3 className='text-lg font-medium text-gray-900 dark:text-white'> {title}</h3>
                    <button
                    type='button'
                    className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8  inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer'
                    onClick={onClose}
                    >
                    <svg className='w-3 h-3' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 14 14'>
                        <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13'/>
                    </svg>
                    </button>
                </div>
                <div className='p-4 md:p-5 space-y-4'>
                    {children}
                </div>

            </div>
        </div>
      
    </div>
  )
}

export default Modal
