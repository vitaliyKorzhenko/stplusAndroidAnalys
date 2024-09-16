import * as React from "react";
import {
  useId,
  Button,
  Input,
} from "@fluentui/react-components";
import { SearchRegular } from "@fluentui/react-icons";
import type { ButtonProps } from "@fluentui/react-components";

const MicButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      {...props}
      appearance="transparent"
      icon={<SearchRegular />}
      size="small"
    />
  );
};

export const SeachCommandsInput = () => {

  const afterId = useId("content-after");
 

  return (
        <Input
          contentAfter={<MicButton aria-label="Enter commands" />}
          id={afterId}
          style={{ width: "100%", maxWidth: '150px' }}
          placeholder="Enter commands"
        />
  );
};