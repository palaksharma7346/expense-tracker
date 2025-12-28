import moment from "moment";

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
    };
    export const getInitials = (name)=>{
        if(!name)return "";
        const words = name.split("");
        let initials = "";
        for(let i =0;i<Math.min(words,length,2);i++){
            initials += words[i][0];
        }
        return initials.toUpperCase();
    };
export const addThousandsSeparator = (num) => {
   if(num == null || isNaN(num)) return "";
   const [integerPart, fractionalPart] = num.toString().split('.');
   const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   return fractionalPart ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
};

export const prepareExpenseBarChartData = (data = []) => {
  if (!Array.isArray(data)) return [];

  const grouped = {};

  data.forEach((item) => {
    if (!item?.date || item?.amount == null) return;
    const key = moment(item.date).format('Do MMM');
    grouped[key] = grouped[key] || { amount: 0 };
    grouped[key].amount += Number(item.amount) || 0;
    if (!grouped[key].category && item.category) grouped[key].category = item.category;
  });

  return Object.keys(grouped).map((key) => ({
    month: key,
    amount: grouped[key].amount,
    category: grouped[key].category || ''
  }));
}

export const prepareIncomeBarChartData = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date))

    const chartData = sortedData.map(item => ({
        month: moment(item?.date).format('Do MMM'),
        amount: item?.amount,
        source: item?.source
    }));
    return chartData;
};
export const prepareExpenseLineChartData = (data = []) => {
  if (!Array.isArray(data)) return [];

  const groupedData = {};

  data.forEach((item) => {
    if (!item?.date || !item?.amount) return;

    const date = new Date(item.date);
    if (isNaN(date)) return;

    const key = date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });

    groupedData[key] =
      (groupedData[key] || 0) + Number(item.amount);
  });

  return Object.keys(groupedData).map((key) => ({
    month: key,
    amount: groupedData[key],
  }));
};
