
import { AccountSettingsForm } from "@/components/account/account-settings-form";

export default function SettingsPage() {
    return (
        <div>
             <div className="mb-8">
                <h1 className="text-2xl font-bold">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your personal information and password.
                </p>
            </div>
            <AccountSettingsForm />
        </div>
    )
}
