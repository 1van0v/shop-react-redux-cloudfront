import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import { Alert, AlertTitle } from '@material-ui/lab';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(3, 0, 3),
  },
  alert: {
    top: '80px',
    right: '10px',
    width: '300px',
    position: 'fixed'
  }
}));

type CSVFileImportProps = {
  url: string,
  title: string
};

export default function CSVFileImport({url, title}: CSVFileImportProps) {
  const classes = useStyles();
  const [file, setFile] = useState<any>();
  const [alert, setAlert] = useState<string>();

  const onFileChange = (e: any) => {
    console.log(e);
    let files = e.target.files || e.dataTransfer.files
    if (!files.length) return
    setFile(files.item(0));
  };

  const removeFile = () => {
    setFile('');
  };

  const uploadFile = async (e: any) => {
      // Get the presigned URL
      const token = localStorage.getItem('token');
      let response;

      try {
        const headers = token ? {Authorization: `Basic ${token}`} : {};
        response = await axios({
          method: 'GET',
          url,
          params: {
            name: encodeURIComponent(file.name)
          },
          headers
        });
      } catch (e) {
        if ([401, 403].includes(e.status)) {
          console.log(e);
          setAlert(`Action is ${e.data.message}`);
          setTimeout(() => setAlert(''), 10000);
          return;
        }

        throw(e);
      }

      console.log('File to upload: ', file.name)
      console.log('Uploading to: ', response.data)
      const result = await fetch(response.data, {
        method: 'PUT',
        body: file
      })
      console.log('Result: ', result)
      setFile('');
    }
  ;

  return (
    <div className={classes.content}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
          <input type="file" onChange={onFileChange}/>
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}

      {alert &&
        <Alert variant="outlined" severity="error" className={classes.alert}>
          <AlertTitle>Error</AlertTitle>
          {alert}
        </Alert>
      }
    </div>
  );
}
