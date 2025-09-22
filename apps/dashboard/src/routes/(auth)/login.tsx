import { Button } from '@safeoutput/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@safeoutput/ui/components/card';
import { LabeledSeparator, Separator } from '@safeoutput/ui/components/separator';
import { TextField, TextFieldInput, TextFieldLabel } from '@safeoutput/ui/components/text-field';

export default function Login() {
  return (
    <Card class="w-[384px] max-w-[384px]">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription class="flex gap-1 items-center">
          New to Safeoutput?
          <Button variant="link" class="p-0">
            Sign up
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-5">
        <LabeledSeparator>OR</LabeledSeparator>
        <TextField>
          <TextFieldLabel>Email</TextFieldLabel>
          <TextFieldInput type="email" placeholder="example@domain.com" />
        </TextField>
        <TextField>
          <TextFieldLabel>Password</TextFieldLabel>
          <TextFieldInput type="password" placeholder="●●●●●●●●●" />
        </TextField>
        <Button>Log in to account</Button>
      </CardContent>
    </Card>
  );
}
