import React from 'react'

const InfoCard = (
    { icon, label, value, color }
) => {
  return (
    <div className='flex gap-6  p-4 bg-white rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50'>
      <div className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-full box-shadow-xl`}>
        {icon}
      </div>
      <div className='mt-2'>
        <h6 className='text-sm font-medium text-gray-500 mb-1'>{label}</h6>
        <span className='text-[22px] font-bold'>${value}</span>
      </div>
    </div>
  )
}

export default InfoCard
