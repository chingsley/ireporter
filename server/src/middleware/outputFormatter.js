const formatOutput = (records) => {
  for (let k = 0; k < records.length; k += 1) {
    if (records[k].images.length > 0) {
      const imageArr = records[k].images.split(',');
      const formattedImgArr = [];
      for (let i = 0; i < imageArr.length; i += 1) {
        formattedImgArr.push(`http://localhost:${process.env.PORT}/${imageArr[i].trim()}`);
      }
      records[k].images = formattedImgArr;
    } else {
      records[k].images = [];
    }

    if (records[k].videos.length > 0) {
      const videoArr = records[k].videos.split(',');
      const formattedVidArr = [];
      for (let i = 0; i < videoArr.length; i += 1) {
        formattedVidArr.push(`http://localhost:${process.env.PORT}/${videoArr[i].trim()}`);
      }
      records[k].videos = formattedVidArr;
    } else {
      records[k].videos = [];
    }
  }
  const formattedOutput = records.map((record) => {
    const formatted = {
      id: record.id,
      createdOn: record.created_on,
      createdBy: record.created_by,
      type: record.type,
      location: record.location,
      status: record.status,
      Images: record.images,
      Videos: record.videos,
      comment: record.comment,
    };
    return formatted;
  });

  return formattedOutput;
};

export default formatOutput;
