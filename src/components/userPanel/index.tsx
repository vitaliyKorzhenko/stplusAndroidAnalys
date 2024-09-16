import * as React from "react";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Button,
  Label,
  useId,
  tokens,
  makeStyles,
  Input,
  shorthands,
  Persona,
  ToolbarButton,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { PersonRegular, PhoneRegular, MailRegular, People24Regular } from "@fluentui/react-icons";
import { SubscriptionButton } from "../subscritionButton";
import { LogoutButton } from "../logoutButton";
import { UserProfile } from "../../users";
import { ApiUserNode } from "../../api/ApiUser";
import { SaveProfileButton } from "../saveProfileButton";
import { IChangeProfileModel } from "../../api/types";
import { CountriesDropdown } from "../countriesDropdown";
import { translate } from "../../localization/localization";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
    // Prevent the example from taking the full width of the page (optional)
    maxWidth: "400px",
    // Stack the label above the field (with 2px gap per the design system)
    "> div": {
      display: "flex",
      flexDirection: "column",
      ...shorthands.gap("2px"),
    },
  },
  main: {
    display: "grid",
    justifyContent: "flex-start",
    gridRowGap: tokens.spacingVerticalXXL,
  },

  field: {
    display: "grid",
    gridRowGap: tokens.spacingVerticalS,
  },

  button: {
   marginLeft: "auto",
  },
  container: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
  },
  personaWrapper: {
    display: "flex",
    alignItems: "center",
  },
});


export interface UserPanelProps {
  changeAuth?: () => void;
}

export const UserPanel = (props: UserPanelProps) => {
  const styles = useStyles();
 

  const [open, setOpen] = React.useState(false);
  const [customSize] = React.useState(400);

  const beforeId = useId("content-before");

  const [firstName , setFirstName] = React.useState(UserProfile.getFirstName());

  const [lastName , setLastName] = React.useState(UserProfile.getLastName());

  const [phone, setPhone] = React.useState(UserProfile.getPhone());

  const [email, setEmail] = React.useState(UserProfile.getEmail());

  const [countryCode, setCountryCode] = React.useState(UserProfile.getCountryCode());

  const updateProfile = async () => {
    const profileInfo: IChangeProfileModel = {
      first_name: firstName ? firstName : UserProfile.getFirstName(),
      last_name: lastName ? lastName : UserProfile.getLastName(),
      phone_number: phone ? phone : UserProfile.getPhone(),
      country_code: countryCode ? countryCode : UserProfile.getCountryCode()
    }
    await ApiUserNode.changeUserProfile(profileInfo);
  }

  const updateCountryCode = (country: string) => {
    UserProfile.setCountryCode(country);
    setCountryCode(country);
  }

  React.useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log("USER PANEL - USER ID", userId);
    if (userId) {
    UserProfile.setCurrentUserId(userId.toString());
    ApiUserNode.getProfile(userId).then((response) => {
      console.log('USER PROFILE', response);
      UserProfile.initUserProfile(response);
      setFirstName(UserProfile.getFirstName());
      setLastName(UserProfile.getLastName());
      setPhone(UserProfile.getPhone());
      setEmail(UserProfile.getEmail());
      setCountryCode(UserProfile.getCountryCode());
    }).catch((error) => {
      console.log('error', error);
    })
  }
  }
  , []);

  return (
    <div>
      <OverlayDrawer
        open={open}
        position="end"
        onOpenChange={(_, state) => setOpen(state.open)}
        style={{ width: `${customSize}px` }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={() => setOpen(false)}
                
              />
            }
          >
           {/* <AccountButton/> */}
           {/* <SubscriptionButton/> */}
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody>
          <div className={styles.root}>
            <div className={styles.container}>
              <div className={styles.personaWrapper}>
            <Persona
        presence={{ status: "available" }}
        size="medium"
        name="Vitaliy Korzhenko"
        avatar={{ color: "colorful" }}
        secondaryText={email}
      />
            <SubscriptionButton className={styles.button}/>

      </div>
            </div>
          
            <div>
              <Label htmlFor={beforeId}>
                {translate('ui.label.firstName', 'First name')}
              </Label>
              <Input contentBefore={<PersonRegular />} 
              id={beforeId} 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              />
      </div>
      <div>
              <Label htmlFor={beforeId}>
                {translate('ui.label.lastName', 'Last name')}
              </Label>
              <Input contentBefore={<PersonRegular />} 
              id={beforeId} 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              />
      </div>
      <div>
              <Label htmlFor={beforeId}>
                {translate('ui.label.phone', 'Phone')}
              </Label>
              <Input contentBefore={<PhoneRegular/>} 
              id={beforeId} 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              />
      </div>
      <div>
              <Label typeof="email" 
              htmlFor={beforeId}
              >
                {translate('ui.label.email', 'Email')}
              </Label>
              <Input contentBefore={<MailRegular/>} 
              id={beforeId} 
              disabled={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              />
      </div>
      <div>
        <CountriesDropdown
        selectedCountry={UserProfile.getCountryCode()}
        onChange={(country) => {
          updateCountryCode(country);
          
        }}

        />
      </div>
      <div>
        <SaveProfileButton
        onClick={updateProfile}
        />
      </div>
            <div>
              <LogoutButton
               changeAuth={props.changeAuth}
              />
            </div>
          </div>
        </DrawerBody>
      </OverlayDrawer>

      <div className={styles.main}>
      <ToolbarButton
      aria-label="User"
      style={{ color: 'white',
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none', 
     }} // Устанавливаем цвет текста и фон
      icon={<People24Regular style={{color: 'white'}} />} 
      onClick={() => setOpen(true)}
    />
      </div>
    </div>
  );
};
