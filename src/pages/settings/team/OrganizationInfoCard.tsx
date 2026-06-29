import { useState } from 'react';
import { Building2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardHeader, Loader } from '@/components/atoms';
import { UpdateTenantDrawer } from '@/components/molecules';
import useUser from '@/hooks/useUser';

const OrganizationInfoCard = () => {
	const { t } = useTranslation(['settings', 'common']);
	const { user, loading } = useUser();
	const [editOpen, setEditOpen] = useState(false);

	return (
		<Card variant='default' className='rounded-xl border border-gray-200 bg-white shadow-sm'>
			<div className='flex items-start gap-4'>
				<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600'>
					<Building2 className='h-5 w-5' />
				</div>
				<div className='min-w-0 flex-1'>
					<CardHeader
						className='mb-0'
						title={user?.tenant?.name ?? t('organization.title')}
						titleClassName='text-base font-semibold text-zinc-900'
						cta={
							user ? (
								<UpdateTenantDrawer
									data={user}
									open={editOpen}
									onOpenChange={setEditOpen}
									trigger={
										<Button variant='ghost' size='icon' className='h-8 w-8' aria-label={t('organization.editOrganization')}>
											<Pencil className='h-4 w-4' />
										</Button>
									}
								/>
							) : null
						}
					/>
					{loading ? (
						<Loader />
					) : (
						<div className='mt-1 flex flex-col gap-2'>
							<p className='text-sm text-zinc-600'>{user?.email}</p>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
};

export default OrganizationInfoCard;
