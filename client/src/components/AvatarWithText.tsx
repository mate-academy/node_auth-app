import { FC } from "react";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

type Props = {
  text: string;
  icon?: JSX.Element;
};

const AvatarWithText: FC<Props> = ({ text, icon = <LockOutlinedIcon /> }) => {
  return (
    <>
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>{icon}</Avatar>
      <Typography component="h1" variant="h5">
        {text}
      </Typography>
    </>
  );
};

export default AvatarWithText;
