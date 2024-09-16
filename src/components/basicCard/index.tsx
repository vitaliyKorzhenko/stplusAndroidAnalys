import {
  makeStyles,
  shorthands,
  Button,
  Body1,
  CardFooter,
  Label,
} from "@fluentui/react-components";
import { ShareRegular, ListRtl20Regular } from "@fluentui/react-icons";

import { Card, CardHeader } from "@fluentui/react-components";
import CustomIcon from "../CommandIconItem";




const useStyles = makeStyles({
  card: {
    ...shorthands.margin("auto"),
    width: "720px",
    maxWidth: "100%",
  },
});

export interface BasicCardProps {
    name: string;
    countCommands: number;
    changeMode?: () => void;
    description: string;
    id: string;
}

export const BasicCard = (props: BasicCardProps ) => {
  const styles = useStyles();

  return (
        <Card 
        className={styles.card} 
        // onClick={() => {
        //   if (props.changeMode)
        //   props.changeMode();
        
        // }}
        >
                <CardHeader
        header={
          <Body1 style={{ display: 'flex', alignItems: 'center' }}>
          <CustomIcon  isLight= {true} id={props.id}/>
          <Label size="large">{props.name}</Label> 
          </Body1>
        }
      />
             <CardFooter>
        <Button 
        style={{
            backgroundColor: "#1C1C1C",
            color: "white",
            borderRadius: "20px",
            padding: "5px 20px"
        }}
        icon={<ShareRegular fontSize={16} />}
        onClick={() => {
          if (props.changeMode)
          props.changeMode();
        }}
        >
          Open
        </Button>
        <Button 
        style={{
            backgroundColor: "#B22222",
            color: "white",
            borderRadius: "20px",
            padding: "5px 20px"
        
        }}
        icon={<ListRtl20Regular fontSize={16} />}>{
          
         }
         {props.countCommands}
         </Button>
      </CardFooter>
        </Card>
  );
};