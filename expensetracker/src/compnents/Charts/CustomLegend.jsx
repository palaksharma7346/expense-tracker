import React from 'react'

const CustomLegend = ({payload}) => {
  return (
    <div className='flex flex-wrap gap-2 mt-4 space-x-6 justify-center '>
        {payload.map((entry,index)=>(
            <div key={`legend-${index}`} className='flex items-center space-x-2'>
              <div className='w-2 h-2  rounded-full'
              style={{backgroundColor: entry.color}}>

              </div>
              <span className=' text-xs gray-700 font-medium'>
                {entry.value}
              </span>
            </div>
        ))}

    </div>
  )
}

export default CustomLegend
