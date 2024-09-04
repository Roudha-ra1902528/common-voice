import React, { useEffect, useState } from 'react';
import API from '../../../../services/api';

interface LanguageSelectProps {
  onSelectLanguage: (language: string) => void;
  api: API;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ onSelectLanguage, api }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(sessionStorage.getItem('language') ?? 'en');
  const [languagess, setLanguages] = useState<string[]>();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await api.fetchClientLanguages(); // Fetch languages
        setLanguages(response)
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };

    fetchLanguages();
  }, []);

  const handleSelectLanguage = (language: string) => {
    sessionStorage.setItem('language', language);
    setSelectedLanguage(language);
    onSelectLanguage(language);
    setDropdownOpen(false); // Close the dropdown after selection
  };

  return (
    <>
      {/* {JSON.stringify(languagess)} */}

      <div className="dropdown-container">
        <div
          className="dropdown-header"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {selectedLanguage ? selectedLanguage.toUpperCase() : 'Select Language'}
          <span className={`arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
        </div>
        {dropdownOpen && (
          <ul className="dropdown-list">
            {languagess.map((language) => (
              <li
                key={language}
                className="dropdown-list-item"
                onClick={() => handleSelectLanguage(language)}
              >
                {language.toUpperCase()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default LanguageSelect;
