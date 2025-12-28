// import React from 'react'
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend,Tooltip } from 'recharts';
// import CustomTooltip from './CustomTooltip';
// import CustomLegend from './CustomLegend';
// const CustomPieChart = ({ data, label, totalAmount, colors, showTextAnchor }) => {
//   return (
//     <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//             <Pie
//                 data={data}
//                 dataKey="amount"
//                 nameKey="name"
//                 labelLine={false}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={60}
//                 outerRadius={80}
                
//             >
//                 {data.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
//                 ))}
//             </Pie>
//             <Tooltip content={CustomTooltip}/>
//             <Legend content={CustomLegend}/>
//             {showTextAnchor && (
//                 <>
//                 <text
//                     x="50%"
//                     y="50%"
//                     dy={-25}
//                     textAnchor="middle"
//                     fill="#666"
//                     fontSize="14px"
//                 >
//                     {label}
//                 </text>
//                 <text
//                     x="50%"
//                     y="50%"
//                     dy={8}
//                     textAnchor="middle"
//                     fill="#333"
//                     fontSize="24px"
//                     fontWeight="semi-bold"
//                 >
//                     {totalAmount}
//                 </text>
//                 </>
//             )}
//         </PieChart>
//     </ResponsiveContainer>
//   )
// }

// export default CustomPieChart
import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const CustomPieChart = ({ data, label, totalAmount, colors, showTextAnchor }) => {

  // Custom tooltip that shows amount
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: '8px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0 }}>{payload[0].name}</p>
          <p style={{ margin: 0 }}>Amount: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"  // This must match your data field
          nameKey="name"    // This must match your data field
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>

        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {showTextAnchor && (
          <>
            <text
              x="50%"
              y="50%"
              dy={-20}
              textAnchor="middle"
              fill="#666"
              fontSize="14px"
            >
              {label}
            </text>

            <text
              x="50%"
              y="50%"
              dy={10}
              textAnchor="middle"
              fill="#333"
              fontSize="24px"
              fontWeight="600"
            >
              {totalAmount}
            </text>
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}

export default CustomPieChart
