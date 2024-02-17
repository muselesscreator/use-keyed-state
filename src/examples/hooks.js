import React from 'react';
import { post } from './axios';

import { StrictDict } from '@muselesscreator/strict-dict';
import { useKeyedState } from '../hooks';

export const stateKeys = StrictDict({
  importedClicked: 'importedClicked',
  fileInputChanged: 'fileInputChanged',
  loaded: 'loaded',
  numEvents: 'numEvents',
});

export const formUrl = 'localhost:18000/form-url';

export const useExampleComponentData = () => {
  const [importClicked, setImportClicked] = useKeyedState(stateKeys.importedClicked, 0);
  const [fileChanged, setFileChanged] = useKeyedState(stateKeys.fileInputChanged, null);
  const [, setLoaded] = useKeyedState(stateKeys.loaded, false);
  const [, setNumEvents] = useKeyedState(stateKeys.numEvents, 0);
  const fileInputRef = React.useRef();

  React.useEffect(() => {
    setLoaded(true);
  }, [setLoaded]);

  React.useEffect(() => {
    setNumEvents(num => num + 1);
  }, [setNumEvents, importClicked, fileChanged]);

  const handleImportedComponentClicked = () => {
    fileInputRef.current?.click();
    setImportClicked(val => val + 1);
  };
  const handleFileInputChanged = (file) => {
    if (fileInputRef.current?.files[0]) {
      const clearInput = () => { fileInputRef.current.value = null; };
      const formData = new FormData();
      formData.append('csv', fileInputRef.current.files[0]);
      post(formUrl, formData).then(clearInput);
    }
    setFileChanged(file);
  };

  return {
    fileInputRef,
    formAction: formUrl,
    handleImportedComponentClicked,
    handleFileInputChanged,
  };
};

export default useExampleComponentData;
